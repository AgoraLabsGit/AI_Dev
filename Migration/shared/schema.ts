import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  level: text('level', { enum: ['beginner', 'intermediate', 'advanced'] }).default('beginner'),
  streak: integer('streak').default(0),
  totalScore: integer('total_score').default(0),
  preferences: text('preferences', { mode: 'json' }).default('{}'),
})

// Spanish sentences for practice
export const sentences = sqliteTable('sentences', {
  id: text('id').primaryKey(),
  spanish: text('spanish').notNull(),
  english: text('english').notNull(),
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  category: text('category'), // e.g., 'daily_life', 'business', 'travel'
  hints: text('hints', { mode: 'json' }).notNull(), // Array of hint strings
  grammarPoints: text('grammar_points', { mode: 'json' }), // Array of grammar concepts
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
})

// User progress tracking
export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  attempts: integer('attempts').default(0),
  bestScore: integer('best_score').default(0),
  lastAttemptAt: integer('last_attempt_at', { mode: 'timestamp' }),
  mastered: integer('mastered', { mode: 'boolean' }).default(false),
  averageScore: real('average_score').default(0),
})

// Individual practice sessions
export const practiceSessions = sqliteTable('practice_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  totalSentences: integer('total_sentences').default(0),
  completedSentences: integer('completed_sentences').default(0),
  averageScore: real('average_score').default(0),
  sessionType: text('session_type').default('standard'), // 'standard', 'review', 'challenge'
})

// Individual sentence evaluations
export const evaluations = sqliteTable('evaluations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').references(() => practiceSessions.id, { onDelete: 'cascade' }),
  userTranslation: text('user_translation').notNull(),
  aiEvaluation: text('ai_evaluation', { mode: 'json' }).notNull(), // Full AI response
  score: integer('score').notNull(), // 0-100
  feedback: text('feedback').notNull(),
  hintsUsed: integer('hints_used').default(0),
  timeSpent: integer('time_spent'), // in seconds
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// AI evaluation caching for cost optimization
export const evaluationCache = sqliteTable('evaluation_cache', {
  id: text('id').primaryKey(),
  sentenceId: text('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  userTranslation: text('user_translation').notNull(),
  translationHash: text('translation_hash').notNull(), // Hash of normalized translation
  aiResponse: text('ai_response', { mode: 'json' }).notNull(),
  score: integer('score').notNull(),
  feedback: text('feedback').notNull(),
  cacheLevel: text('cache_level', { enum: ['exact', 'similar', 'semantic'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  hitCount: integer('hit_count').default(1),
})

// Learning analytics
export const learningAnalytics = sqliteTable('learning_analytics', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  practiceTime: integer('practice_time').default(0), // in minutes
  sentencesCompleted: integer('sentences_completed').default(0),
  averageScore: real('average_score').default(0),
  hintsUsed: integer('hints_used').default(0),
  streakDay: integer('streak_day').default(0),
  difficultiesEncountered: text('difficulties_encountered', { mode: 'json' }), // Array of difficulty areas
})

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  sessions: many(practiceSessions),
  evaluations: many(evaluations),
  analytics: many(learningAnalytics),
}))

export const sentencesRelations = relations(sentences, ({ many }) => ({
  progress: many(userProgress),
  evaluations: many(evaluations),
  cache: many(evaluationCache),
}))

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  sentence: one(sentences, {
    fields: [userProgress.sentenceId],
    references: [sentences.id],
  }),
}))

export const practiceSessionsRelations = relations(practiceSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [practiceSessions.userId],
    references: [users.id],
  }),
  evaluations: many(evaluations),
}))

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  user: one(users, {
    fields: [evaluations.userId],
    references: [users.id],
  }),
  sentence: one(sentences, {
    fields: [evaluations.sentenceId],
    references: [sentences.id],
  }),
  session: one(practiceSessions, {
    fields: [evaluations.sessionId],
    references: [practiceSessions.id],
  }),
}))

export const evaluationCacheRelations = relations(evaluationCache, ({ one }) => ({
  sentence: one(sentences, {
    fields: [evaluationCache.sentenceId],
    references: [sentences.id],
  }),
}))

export const learningAnalyticsRelations = relations(learningAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [learningAnalytics.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertSentenceSchema = createInsertSchema(sentences)
export const selectSentenceSchema = createSelectSchema(sentences)

export const insertUserProgressSchema = createInsertSchema(userProgress)
export const selectUserProgressSchema = createSelectSchema(userProgress)

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions)
export const selectPracticeSessionSchema = createSelectSchema(practiceSessions)

export const insertEvaluationSchema = createInsertSchema(evaluations)
export const selectEvaluationSchema = createSelectSchema(evaluations)

export const insertEvaluationCacheSchema = createInsertSchema(evaluationCache)
export const selectEvaluationCacheSchema = createSelectSchema(evaluationCache)

export const insertLearningAnalyticsSchema = createInsertSchema(learningAnalytics)
export const selectLearningAnalyticsSchema = createSelectSchema(learningAnalytics)

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Sentence = typeof sentences.$inferSelect
export type NewSentence = typeof sentences.$inferInsert

export type UserProgress = typeof userProgress.$inferSelect
export type NewUserProgress = typeof userProgress.$inferInsert

export type PracticeSession = typeof practiceSessions.$inferSelect
export type NewPracticeSession = typeof practiceSessions.$inferInsert

export type Evaluation = typeof evaluations.$inferSelect
export type NewEvaluation = typeof evaluations.$inferInsert

export type EvaluationCache = typeof evaluationCache.$inferSelect
export type NewEvaluationCache = typeof evaluationCache.$inferInsert

export type LearningAnalytics = typeof learningAnalytics.$inferSelect
export type NewLearningAnalytics = typeof learningAnalytics.$inferInsert
