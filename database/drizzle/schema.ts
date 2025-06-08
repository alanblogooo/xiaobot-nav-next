import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// Categories 表
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index('categories_name_idx').on(table.name),
}))

// Columns 表
export const columns = sqliteTable('columns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  avatar: text('avatar').notNull(),
  name: text('name').notNull(),
  author: text('author').notNull(),
  subscribers: integer('subscribers').default(0).notNull(),
  contentCount: integer('contentCount').default(0).notNull(),
  description: text('description'),
  url: text('url').notNull(),
  categoryId: text('categoryId').references(() => categories.id),
  isPublished: integer('isPublished', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index('columns_name_idx').on(table.name),
  authorIdx: index('columns_author_idx').on(table.author),
  createdAtIdx: index('columns_createdAt_idx').on(table.createdAt),
  categoryIdIdx: index('columns_categoryId_idx').on(table.categoryId),
  isPublishedIdx: index('columns_isPublished_idx').on(table.isPublished),
  publishedCategoryUpdatedIdx: index('columns_published_category_updated_idx').on(table.isPublished, table.categoryId, table.updatedAt),
  publishedUpdatedIdx: index('columns_published_updated_idx').on(table.isPublished, table.updatedAt),
  categoryUpdatedIdx: index('columns_category_updated_idx').on(table.categoryId, table.updatedAt),
}))

// InviteCodes 表
export const inviteCodes = sqliteTable('invite_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').default('').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// 关系定义
export const categoriesRelations = relations(categories, ({ many }) => ({
  columns: many(columns),
}))

export const columnsRelations = relations(columns, ({ one }) => ({
  category: one(categories, {
    fields: [columns.categoryId],
    references: [categories.id],
  }),
})) 