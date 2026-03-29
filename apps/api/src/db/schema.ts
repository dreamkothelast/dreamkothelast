import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['merchant', 'driver', 'admin'])
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled',
])
export const vehicleTypeEnum = pgEnum('vehicle_type', ['bike', 'scooter', 'car', 'van'])

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const merchantProfiles = pgTable('merchant_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  shopName: varchar('shop_name', { length: 255 }).notNull(),
  siret: varchar('siret', { length: 14 }).notNull().unique(),
  address: jsonb('address').notNull(),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
})

export const driverProfiles = pgTable('driver_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  isAvailable: boolean('is_available').notNull().default(false),
  currentLocation: jsonb('current_location'),
  zones: text('zones').array().notNull().default([]),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
})

export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').notNull().references(() => users.id),
  driverId: uuid('driver_id').references(() => users.id),
  status: deliveryStatusEnum('status').notNull().default('pending'),
  pickup: jsonb('pickup').notNull(),
  dropoff: jsonb('dropoff').notNull(),
  packageInfo: jsonb('package_info').notNull(),
  priceInCents: integer('price_in_cents').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  acceptedAt: timestamp('accepted_at'),
  pickedUpAt: timestamp('picked_up_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
