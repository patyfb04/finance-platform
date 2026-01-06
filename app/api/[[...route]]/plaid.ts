import { db } from "@/app/database/drizzle";
import {
  accounts,
  categories,
  connectedBanks,
  transactions,
} from "@/app/database/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { ok } from "assert";
import { create } from "domain";
import { Hono } from "hono";
import { eq, isNotNull, and } from "drizzle-orm";

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from "plaid";
import z from "zod";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_TOKEN,
      "PLAID-SECRET": process.env.PLAID_SECRET_ID,
    },
  },
});
const plaidClient = new PlaidApi(configuration);

const app = new Hono()
  .post("/create-link-token", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // const user = await (await clerkClient()).users.getUser(auth.userId);
    // const email = user.emailAddresses[0]?.emailAddress || "";

    console.log("Creating link token for user:", auth.userId);

    const token = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: auth.userId,
        // email_address: email,
      },
      client_name: "Finance Platform",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return c.json({ data: token.data.link_token });
  })
  .post(
    "/exchange-public-token",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        public_token: z.string(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { public_token } = await c.req.valid("json");
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });

      const [connectedBank] = await db
        .insert(connectedBanks)
        .values({
          userId: auth.userId,
          accessToken: response.data.access_token,
          id: response.data.item_id,
        })
        .returning();

      const plaidTransactions = await plaidClient.transactionsSync({
        access_token: response.data.access_token,
      });

      const plaidAccounts = await plaidClient.accountsGet({
        access_token: response.data.access_token,
      });

      const plaidCategories = await plaidClient.categoriesGet({});

      const newAccounts = await db
        .insert(accounts)
        .values(
          plaidAccounts.data.accounts.map((account) => ({
            plaidId: account.account_id,
            name: account.name,
            userId: auth.userId,
            id: createId(),
          }))
        )
        .returning();

      const newCategories = await db
        .insert(categories)
        .values(
          plaidCategories.data.categories.map((category) => ({
            name: category.hierarchy.join(", "),
            userId: auth.userId,
            plaidId: category.category_id,
            id: createId(),
          }))
        )
        .returning();

      const newTransactions = plaidTransactions.data.added.reduce(
        (acc, transaction) => {
          const account = newAccounts.find(
            (account) => account.plaidId === transaction.account_id
          );
          const category = newCategories.find(
            (category) => category.plaidId === transaction.category_id
          );

          if (account) {
            acc.push({
              id: createId(),
              accountId: account.id,
              amount: transaction.amount.toString(),
              payee: transaction.merchant_name || transaction.name,
              notes: transaction.name,
              date: new Date(transaction.date),
              categoryId: category ? category.id : null,
            });
          }
          return acc;
        },
        [] as (typeof transactions.$inferInsert)[]
      );

      if (newTransactions.length > 0) {
        await db.insert(transactions).values(newTransactions);
      }

      return c.json({ data: response.data }, 200);
    }
  )
  .get("/connected-bank", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [connectedBank] = await db
      .select()
      .from(connectedBanks)
      .where(eq(connectedBanks.userId, auth.userId));

    return c.json({ data: connectedBank || null });
  })
  .delete("/connected-bank", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [connectedBank] = await db
      .delete(connectedBanks)
      .where(eq(connectedBanks.userId, auth.userId))
      .returning({
        id: connectedBanks.id,
      });

    if (!connectedBank) {
      return c.json({ error: "Connected bank not found" }, 404);
    }
    await db
      .delete(accounts)
      .where(
        and(eq(accounts.userId, auth.userId), isNotNull(accounts.plaidId))
      );

    await db
      .delete(categories)
      .where(
        and(eq(categories.userId, auth.userId), isNotNull(categories.plaidId))
      );
    return c.json({ data: connectedBank || null });
  });

export default app;
