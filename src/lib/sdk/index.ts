import {
  drizzleAdapter,
  type DrizzleAdapterConfig,
} from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { toNextJsHandler } from "better-auth/next-js";
import type { DrizzlePgConfig } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "@/lib/db/relations";
import { schema } from "@/lib/db/schema";

export type SdkDatabaseConfig = Partial<DrizzlePgConfig<typeof relations>> & {
  url?: string;
};

export type SdkAdapterConfig = Partial<DrizzleAdapterConfig>;

export type SdkAuthConfig = Omit<BetterAuthOptions, "database">;

export interface SdkConfig {
  database?: SdkDatabaseConfig;
  adapter?: SdkAdapterConfig;
  auth?: SdkAuthConfig;
}

export function createSdk(config: SdkConfig = {}) {
  const { url, ...drizzleConfig } = config.database ?? {};
  const databaseUrl = url ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing database URL. Pass `database.url` to createSdk() or set DATABASE_URL."
    );
  }

  const db = drizzle(databaseUrl, {
    relations,
    ...drizzleConfig,
  });

  const auth = betterAuth({
    ...config.auth,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { ...schema, user: schema.users },
      ...config.adapter,
    }),
    advanced: {
      database: {
        joins: true,
        ...config.auth?.advanced?.database,
      },
      ...config.auth?.advanced,
    },
  });

  return {
    auth,
    db,
    schema,
    handlers: toNextJsHandler(auth),
    getSession: (headers: Headers) => auth.api.getSession({ headers }),
  };
}

export const sdk = createSdk();

export const { auth, db, handlers } = sdk;

export type Sdk = ReturnType<typeof createSdk>;
export type Session = typeof sdk.auth.$Infer.Session;
