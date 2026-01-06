import { db } from "@/app/database/drizzle";
import { connectedBanks } from "@/app/database/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { ok } from "assert";
import { Hono } from "hono";

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

      return c.json({ data: response.data }, 200);
    }
  );

export default app;
