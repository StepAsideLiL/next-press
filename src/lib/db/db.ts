import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "@/lib/db/relations";
import {
  account,
  commentmeta,
  comments,
  links,
  options,
  postmeta,
  posts,
  schema,
  session,
  termmeta,
  termRelationships,
  terms,
  termTaxonomy,
  user,
  usermeta,
  verification,
} from "@/lib/db/schema";

export const db = drizzle(process.env.DATABASE_URL!, { relations });
