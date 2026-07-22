import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  premiumStatus: text('premium_status').default('free'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull(),
  selfieUrl: text('selfie_url').notNull(),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appReports = pgTable('app_reports', {
  id: serial('id').primaryKey(),
  accusedId: text('accused_id').notNull(),
  accusedName: text('accused_name'),
  reporterName: text('reporter_name'),
  reason: text('reason').notNull(),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
