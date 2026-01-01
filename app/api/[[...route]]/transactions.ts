import { Hono } from "hono";
import { db } from "@/app/database/drizzle";
import {
  transactions,
  insertTransactionSchema,
  categories,
  accounts,
} from "@/app/database/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { parse, subDays } from "date-fns";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (c) => {
      const { from, to, accountId } = c.req.valid("query");

      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = (
        from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom
      ) as Date;

      const endDate = (
        to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo
      ) as Date;

      const data = await db
        .select({
          id: transactions.id,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          account: accounts.name,
          accountId: transactions.accountId,
          date: transactions.date,
          notes: transactions.notes,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));
      return c.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (c) => {
      const { id } = c.req.valid("param");
      const auth = getAuth(c);

      if (!id) {
        return c.json({ error: "Missing Id" }, 400);
      }

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      const [data] = await db
        .select({
          id: transactions.id,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          accountId: transactions.accountId,
          date: transactions.date,
          notes: transactions.notes,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));
      return c.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId)
            )
          )
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(transactions.id, sql`select id from ${transactionsToDelete}`)
        )
        .returning({
          id: transactions.id,
        });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string(), // must be required
      })
    ),
    zValidator(
      "json",
      insertTransactionSchema.omit({ id: true }).partial() // PATCH should allow partial updates
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      // Filter out undefined fields so Drizzle doesn't try to set them
      const cleanedValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined)
      );

      // Update only if the transaction belongs to an account owned by the user
      const [data] = await db
        .update(transactions)
        .set(cleanedValues)
        .where(
          and(
            eq(transactions.id, id),
            inArray(
              transactions.accountId,
              db
                .select({ id: accounts.id })
                .from(accounts)
                .where(eq(accounts.userId, auth.userId))
            )
          )
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not Found" }, 404);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      try {
        const [data] = await db
          .delete(transactions)
          .where(
            and(
              eq(transactions.id, id),
              inArray(
                transactions.accountId,
                db
                  .select({ id: accounts.id })
                  .from(accounts)
                  .where(eq(accounts.userId, auth.userId))
              )
            )
          )
          .returning({ id: transactions.id });

        if (!data) {
          return c.json({ error: "Not Found" }, 404);
        }

        return c.json({ data });
      } catch (err) {
        console.error("DELETE /transactions/:id ERROR:", err);
        return c.json(
          { error: "Internal Server Error", details: String(err) },
          500
        );
      }
    }
  )
  .post(
    "/bulk-create",
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        throw new HTTPException(401, {
          res: c.json({ error: "unauthorized" }, 401),
        });
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          }))
        )
        .returning();

      return c.json({ data });
    }
  );

export default app;
