import {
  pgTable,
  bigserial,
  varchar,
  text,
  integer,
  timestamp,
  bigint,
  boolean,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

// 1. Better Auth Core User Table (adapted from users)
export const user = pgTable("user", {
  id: text("id").primaryKey(), // Better Auth uses string IDs (cuid/uuid)
  name: text("name").notNull(), // Mapped from display_name or user_nicename
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // Legacy WordPress Specific Fields (preserved)
  userLogin: varchar("user_login", { length: 60 }).notNull(),
  userPass: varchar("user_pass", { length: 255 }).notNull(), // Handled via Better Auth account plugin or custom logic
  userNicename: varchar("user_nicename", { length: 50 }).notNull(),
  userUrl: varchar("user_url", { length: 100 }).notNull().default(""),
  userActivationKey: varchar("user_activation_key", { length: 255 })
    .notNull()
    .default(""),
  userStatus: integer("user_status").notNull().default(0),
});

// 2. Better Auth Session Table
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 3. Better Auth Account Table (Required for credentials / OAuth mapping)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // Stores hashed password for email/password sign-in
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 4. Better Auth Verification Table (For email verification / password resets)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 5. WordPress Usermeta (Retained to support plugin compatibility if needed)
export const usermeta = pgTable("usermeta", {
  umetaId: bigserial("umeta_id", { mode: "number" }).primaryKey(),
  // Note: if you migrate fully to text IDs, you can change userId type to text
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

// 3. posts[cite: 1]
export const posts = pgTable("posts", {
  id: bigserial("ID", { mode: "number" }).primaryKey(),
  postAuthor: bigint("post_author", { mode: "number" })
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  postDate: timestamp("post_date", { mode: "string" }).notNull(),
  postDateGmt: timestamp("post_date_gmt", { mode: "string" }).notNull(),
  postContent: text("post_content").notNull(),
  postTitle: text("post_title").notNull(),
  postExcerpt: text("post_excerpt").notNull(),
  postStatus: varchar("post_status", { length: 20 })
    .notNull()
    .default("publish"),
  commentStatus: varchar("comment_status", { length: 20 })
    .notNull()
    .default("open"),
  pingStatus: varchar("ping_status", { length: 20 }).notNull().default("open"),
  postPassword: varchar("post_password", { length: 255 }).notNull().default(""),
  postName: varchar("post_name", { length: 200 }).notNull().default(""),
  toPing: text("to_ping").notNull(),
  pinged: text("pinged").notNull(),
  postModified: timestamp("post_modified", { mode: "string" }).notNull(),
  postModifiedGmt: timestamp("post_modified_gmt", { mode: "string" }).notNull(),
  postContentFiltered: text("post_content_filtered").notNull(),
  postParent: bigint("post_parent", { mode: "number" }).notNull().default(0),
  guid: varchar("guid", { length: 255 }).notNull().default(""),
  menuOrder: integer("menu_order").notNull().default(0),
  postType: varchar("post_type", { length: 20 }).notNull().default("post"),
  postMimeType: varchar("post_mime_type", { length: 100 })
    .notNull()
    .default(""),
  commentCount: bigint("comment_count", { mode: "number" })
    .notNull()
    .default(0),
});

// 4. postmeta[cite: 1]
export const postmeta = pgTable("postmeta", {
  metaId: bigserial("meta_id", { mode: "number" }).primaryKey(),
  postId: bigint("post_id", { mode: "number" })
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

// 5. terms[cite: 1]
export const terms = pgTable("terms", {
  termId: bigserial("term_id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull().default(""),
  slug: varchar("slug", { length: 200 }).notNull().default(""),
  termGroup: bigint("term_group", { mode: "number" }).notNull().default(0),
});

// 6. termmeta[cite: 1]
export const termmeta = pgTable("termmeta", {
  metaId: bigserial("meta_id", { mode: "number" }).primaryKey(),
  termId: bigint("term_id", { mode: "number" })
    .notNull()
    .references(() => terms.termId, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

// 7. term_taxonomy[cite: 1]
export const termTaxonomy = pgTable("term_taxonomy", {
  termTaxonomyId: bigserial("term_taxonomy_id", {
    mode: "number",
  }).primaryKey(),
  termId: bigint("term_id", { mode: "number" })
    .notNull()
    .references(() => terms.termId, { onDelete: "cascade" }),
  taxonomy: varchar("taxonomy", { length: 32 }).notNull().default(""),
  description: text("description").notNull(),
  parent: bigint("parent", { mode: "number" }).notNull().default(0),
  count: bigint("count", { mode: "number" }).notNull().default(0),
});

// 8. term_relationships[cite: 1]
export const termRelationships = pgTable("term_relationships", {
  objectId: bigint("object_id", { mode: "number" })
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  termTaxonomyId: bigint("term_taxonomy_id", { mode: "number" })
    .notNull()
    .references(() => termTaxonomy.termTaxonomyId, { onDelete: "cascade" }),
  termOrder: integer("term_order").notNull().default(0),
});

// 9. comments[cite: 1]
export const comments = pgTable("comments", {
  commentId: bigserial("comment_ID", { mode: "number" }).primaryKey(),
  commentPostId: bigint("comment_post_ID", { mode: "number" })
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  commentAuthor: text("comment_author").notNull(),
  commentAuthorEmail: varchar("comment_author_email", { length: 100 })
    .notNull()
    .default(""),
  commentAuthorUrl: varchar("comment_author_url", { length: 200 })
    .notNull()
    .default(""),
  commentAuthorIp: varchar("comment_author_IP", { length: 100 })
    .notNull()
    .default(""),
  commentDate: timestamp("comment_date", { mode: "string" }).notNull(),
  commentDateGmt: timestamp("comment_date_gmt", { mode: "string" }).notNull(),
  commentContent: text("comment_content").notNull(),
  commentKarma: integer("comment_karma").notNull().default(0),
  commentApproved: varchar("comment_approved", { length: 20 })
    .notNull()
    .default("1"),
  commentAgent: varchar("comment_agent", { length: 255 }).notNull().default(""),
  commentType: varchar("comment_type", { length: 20 })
    .notNull()
    .default("comment"),
  commentParent: bigint("comment_parent", { mode: "number" })
    .notNull()
    .default(0),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// 10. commentmeta[cite: 1]
export const commentmeta = pgTable("commentmeta", {
  metaId: bigserial("meta_id", { mode: "number" }).primaryKey(),
  commentId: bigint("comment_id", { mode: "number" })
    .notNull()
    .references(() => comments.commentId, { onDelete: "cascade" }),
  metaKey: varchar("meta_key", { length: 255 }),
  metaValue: text("meta_value"),
});

// 11. options[cite: 1]
export const options = pgTable("options", {
  optionId: bigserial("option_id", { mode: "number" }).primaryKey(),
  optionName: varchar("option_name", { length: 191 }).notNull().unique(),
  optionValue: text("option_value").notNull(),
  autoload: varchar("autoload", { length: 20 }).notNull().default("yes"),
});

// 12. links[cite: 1]
export const links = pgTable("links", {
  linkId: bigserial("link_id", { mode: "number" }).primaryKey(),
  linkUrl: varchar("link_url", { length: 255 }).notNull().default(""),
  linkName: varchar("link_name", { length: 255 }).notNull().default(""),
  linkImage: varchar("link_image", { length: 255 }).notNull().default(""),
  linkTarget: varchar("link_target", { length: 25 }).notNull().default(""),
  linkVisible: varchar("link_visible", { length: 20 }).notNull().default("Y"),
  linkOwner: bigint("link_owner", { mode: "number" }).notNull().default(1),
  linkRating: integer("link_rating").notNull().default(0),
  linkUpdated: timestamp("link_updated", { mode: "string" }).notNull(),
  linkRel: varchar("link_rel", { length: 255 }).notNull().default(""),
  linkNotes: text("link_notes").notNull(),
  linkRss: varchar("link_rss", { length: 255 }).notNull().default(""),
});

// --- Self-contained Schema Object & Relational Queries v2 API ---

export const schema = {
  user,
  usermeta,
  posts,
  postmeta,
  terms,
  termmeta,
  termTaxonomy,
  termRelationships,
  comments,
  commentmeta,
  options,
  links,
};

export const relations = defineRelations(schema, (r) => ({
  user: {
    usermeta: r.many.usermeta({
      from: r.user.id,
      to: r.usermeta.userId,
    }),
    posts: r.many.posts({
      from: r.user.id,
      to: r.posts.postAuthor,
    }),
    comments: r.many.comments({
      from: r.user.id,
      to: r.comments.userId,
    }),
  },

  usermeta: {
    user: r.one.user({
      from: r.usermeta.userId,
      to: r.user.id,
    }),
  },

  posts: {
    author: r.one.user({
      from: r.posts.postAuthor,
      to: r.user.id,
    }),
    postmeta: r.many.postmeta({
      from: r.posts.id,
      to: r.postmeta.postId,
    }),
    comments: r.many.comments({
      from: r.posts.id,
      to: r.comments.commentPostId,
    }),
    termTaxonomies: r.many.termTaxonomy({
      from: r.posts.id.through(r.termRelationships.objectId),
      to: r.termTaxonomy.termTaxonomyId.through(
        r.termRelationships.termTaxonomyId
      ),
    }),
  },

  postmeta: {
    post: r.one.posts({
      from: r.postmeta.postId,
      to: r.posts.id,
    }),
  },

  terms: {
    termmeta: r.many.termmeta({
      from: r.terms.termId,
      to: r.termmeta.termId,
    }),
    termTaxonomies: r.many.termTaxonomy({
      from: r.terms.termId,
      to: r.termTaxonomy.termId,
    }),
  },

  termmeta: {
    term: r.one.terms({
      from: r.termmeta.termId,
      to: r.terms.termId,
    }),
  },

  termTaxonomy: {
    term: r.one.terms({
      from: r.termTaxonomy.termId,
      to: r.terms.termId,
    }),
    posts: r.many.posts({
      from: r.termTaxonomy.termTaxonomyId.through(
        r.termRelationships.termTaxonomyId
      ),
      to: r.posts.id.through(r.termRelationships.objectId),
    }),
  },

  termRelationships: {
    post: r.one.posts({
      from: r.termRelationships.objectId,
      to: r.posts.id,
    }),
    termTaxonomy: r.one.termTaxonomy({
      from: r.termRelationships.termTaxonomyId,
      to: r.termTaxonomy.termTaxonomyId,
    }),
  },

  comments: {
    post: r.one.posts({
      from: r.comments.commentPostId,
      to: r.posts.id,
    }),
    user: r.one.user({
      from: r.comments.userId,
      to: r.user.id,
    }),
    commentmeta: r.many.commentmeta({
      from: r.comments.commentId,
      to: r.commentmeta.commentId,
    }),
  },

  commentmeta: {
    comment: r.one.comments({
      from: r.commentmeta.commentId,
      to: r.comments.commentId,
    }),
  },
}));
