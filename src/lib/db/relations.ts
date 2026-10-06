import { defineRelations } from "drizzle-orm";
import { schema } from "@/lib/db/schema";

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
