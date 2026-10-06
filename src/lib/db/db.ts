import { drizzle } from "drizzle-orm/postgres-js";
import {
  account,
  commentmeta,
  comments,
  links,
  options,
  postmeta,
  posts,
  relations,
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

export const db = drizzle(process.env.DATABASE_URL!);
