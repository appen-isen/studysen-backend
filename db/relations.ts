import { relations } from 'drizzle-orm/relations';
import { clubs, posts } from './schema';

export const postsRelations = relations(posts, ({ one }) => ({
  club: one(clubs, {
    fields: [posts.clubId],
    references: [clubs.clubId]
  })
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  posts: many(posts)
}));
