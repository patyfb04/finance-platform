import { db } from "@/app/database/drizzle";
import { accounts, categories, transactions } from "@/app/database/schema";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { and, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod";

const app = new Hono().get(
  "/",
  clerkMiddleware(),
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const { from, to, accountId } = c.req.valid("query");

    if (!auth?.userId) {
      return c.json({ error: "unauthorized" }, 401);
    }

    // -----------------------------
    // DATE RANGE CALCULATION
    // -----------------------------
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 120);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;

    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date range:", { startDate, endDate });
      return c.json({ error: "Invalid date format" }, 400);
    }

    const periodLength = differenceInDays(endDate, startDate) + 1;

    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    // -----------------------------
    // FETCH FINANCIAL DATA
    // -----------------------------
    async function fetchFinancialData(
      userId: string,
      startDate: Date,
      endDate: Date
    ) {
      try {
        const filters = [
          eq(accounts.userId, userId),
          accountId ? eq(transactions.accountId, accountId) : undefined,
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ];

        return await db
          .select({
            income: sql`
              SUM(
                CASE WHEN ${transactions.amount}::numeric >= 0
                THEN ${transactions.amount}::numeric
                ELSE 0
                END
              )
            `.mapWith(Number),

            expenses: sql`
              SUM(
                CASE WHEN ${transactions.amount}::numeric < 0
                THEN ${transactions.amount}::numeric
                ELSE 0
                END
              )
            `.mapWith(Number),
            remaining: sum(sql`${transactions.amount}::numeric`).mapWith(
              Number
            ),
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(...filters.filter(Boolean)));
      } catch (err) {
        console.error("fetchFinancialData error:", err);
        throw err;
      }
    }

    // -----------------------------
    // EXECUTE BOTH PERIOD QUERIES
    // -----------------------------
    const currentPeriod = await fetchFinancialData(
      auth.userId,
      startDate,
      endDate
    );

    const lastPeriod = await fetchFinancialData(
      auth.userId,
      lastPeriodStart,
      lastPeriodEnd
    );

    const current = currentPeriod[0] ?? {
      income: 0,
      expenses: 0,
      remaining: 0,
    };
    const last = lastPeriod[0] ?? { income: 0, expenses: 0, remaining: 0 };

    const incomeChange = calculatePercentageChange(current.income, last.income);

    const expensesChange = calculatePercentageChange(
      current.expenses,
      last.expenses
    );

    const remainingChange = calculatePercentageChange(
      current.remaining,
      last.remaining
    );

    const category = await db
      .select({
        name: categories.name,
        value: sql`SUM(ABS(${transactions.amount}::numeric))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(accounts.userId, auth.userId),
          lt(transactions.amount, "0"),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          accountId ? eq(transactions.accountId, accountId) : undefined
        )
      )
      .groupBy(categories.id, categories.name)
      .orderBy((t) => sql`SUM(ABS(${transactions.amount}::numeric)) DESC`);

    const topCategories = category.slice(0, 3);
    const otherCategories = category.slice(3);
    const otherSum = otherCategories.reduce((acc, curr) => acc + curr.value, 0);

    const finalCategories = topCategories;
    if (otherCategories.length > 0) {
      finalCategories.push({ name: "Others", value: otherSum });
    }

    const activeDays = await db
      .select({
        date: transactions.date,
        income:
          sql`SUM(CASE WHEN ${transactions.amount}::numeric >= 0 THEN ${transactions.amount}::numeric ELSE 0 END)`.mapWith(
            Number
          ),
        expenses:
          sql`SUM(CASE WHEN ${transactions.amount}::numeric < 0 THEN ABS(${transactions.amount}::numeric) ELSE 0 END)`.mapWith(
            Number
          ),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          eq(accounts.userId, auth.userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          accountId ? eq(transactions.accountId, accountId) : undefined
        )
      )
      .groupBy(transactions.date)
      .orderBy(transactions.date);

    const days = fillMissingDays(activeDays, startDate, endDate);

    console.log(days);

    return c.json({
      data: {
        remainingAmount: current.remaining,
        remainingChange,
        incomeAmount: current.income,
        incomeChange,
        expensesAmount: current.expenses,
        expensesChange,
        categories: finalCategories,
        days,
      },
    });
  }
);

export default app;
