import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// ENUMS
// ============================================================
export const userRoleEnum = pgEnum('user_role', ['CLIENT', 'LAWYER', 'PROVIDER', 'ADMIN']);

export const lawyerStatusEnum = pgEnum('lawyer_status', [
  'PENDING_VERIFICATION',
  'VERIFIED',
  'SUSPENDED',
]);

export const consultationStatusEnum = pgEnum('consultation_status', [
  'PENDING_PAYMENT',
  'HELD',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
  'CANCELLED',
  'RELEASED',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const productCategoryEnum = pgEnum('product_category', [
  'LIBROS',
  'ROPA',
  'ACCESORIOS',
  'VIAJES',
  'TECNOLOGIA',
  'OTROS',
]);

// ============================================================
// TABLES
// ============================================================

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('CLIENT'),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  }),
);

export const lawyerProfiles = pgTable(
  'lawyer_profiles',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    colegiatura: varchar('colegiatura', { length: 50 }).notNull().unique(),
    especialidades: jsonb('especialidades').$type<string[]>().notNull().default([]),
    precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
    descripcion: text('descripcion'),
    aniosExperiencia: integer('anios_experiencia').notNull().default(0),
    distrito: varchar('distrito', { length: 100 }),
    ciudad: varchar('ciudad', { length: 100 }).notNull().default('Lima'),
    estado: lawyerStatusEnum('estado').notNull().default('PENDING_VERIFICATION'),
    rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0'),
    totalCases: integer('total_cases').notNull().default(0),
    totalReviews: integer('total_reviews').notNull().default(0),
    fotoUrl: text('foto_url'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('lawyer_profiles_user_id_idx').on(table.userId),
    estadoIdx: index('lawyer_profiles_estado_idx').on(table.estado),
    ciudadIdx: index('lawyer_profiles_ciudad_idx').on(table.ciudad),
    precioIdx: index('lawyer_profiles_precio_idx').on(table.precio),
    ratingIdx: index('lawyer_profiles_rating_idx').on(table.rating),
    colegiaturaIdx: uniqueIndex('lawyer_profiles_colegiatura_idx').on(table.colegiatura),
  }),
);

export const consultations = pgTable(
  'consultations',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    clientId: varchar('client_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    lawyerId: varchar('lawyer_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    monto: decimal('monto', { precision: 10, scale: 2 }).notNull(),
    comision: decimal('comision', { precision: 10, scale: 2 }),
    estado: consultationStatusEnum('estado').notNull().default('PENDING_PAYMENT'),
    escrowId: varchar('escrow_id', { length: 255 }),
    culqiChargeId: varchar('culqi_charge_id', { length: 255 }),
    descripcion: text('descripcion'),
    autoReleaseAt: timestamp('auto_release_at'),
    completedAt: timestamp('completed_at'),
    disputeReason: text('dispute_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    clientIdIdx: index('consultations_client_id_idx').on(table.clientId),
    lawyerIdIdx: index('consultations_lawyer_id_idx').on(table.lawyerId),
    estadoIdx: index('consultations_estado_idx').on(table.estado),
    autoReleaseIdx: index('consultations_auto_release_idx').on(table.autoReleaseAt),
  }),
);

export const messages = pgTable(
  'messages',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    consultationId: varchar('consultation_id', { length: 36 })
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    senderId: varchar('sender_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    contenido: text('contenido').notNull(),
    bloqueado: boolean('bloqueado').notNull().default(false),
    contenidoOriginal: text('contenido_original'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    consultationIdIdx: index('messages_consultation_id_idx').on(table.consultationId),
    senderIdIdx: index('messages_sender_id_idx').on(table.senderId),
  }),
);

export const reviews = pgTable(
  'reviews',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    consultationId: varchar('consultation_id', { length: 36 })
      .notNull()
      .unique()
      .references(() => consultations.id),
    clientId: varchar('client_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    lawyerId: varchar('lawyer_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    rating: integer('rating').notNull(),
    comentario: text('comentario'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    lawyerIdIdx: index('reviews_lawyer_id_idx').on(table.lawyerId),
    clientIdIdx: index('reviews_client_id_idx').on(table.clientId),
    consultationIdIdx: uniqueIndex('reviews_consultation_id_idx').on(table.consultationId),
  }),
);

export const products = pgTable(
  'products',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    providerId: varchar('provider_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    nombre: varchar('nombre', { length: 255 }).notNull(),
    descripcion: text('descripcion'),
    precio: decimal('precio', { precision: 10, scale: 2 }).notNull(),
    categoria: productCategoryEnum('categoria').notNull(),
    stock: integer('stock').notNull().default(0),
    imagen: text('imagen'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    providerIdIdx: index('products_provider_id_idx').on(table.providerId),
    categoriaIdx: index('products_categoria_idx').on(table.categoria),
    precioIdx: index('products_precio_idx').on(table.precio),
    isActiveIdx: index('products_is_active_idx').on(table.isActive),
  }),
);

export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    buyerId: varchar('buyer_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    productId: varchar('product_id', { length: 36 })
      .notNull()
      .references(() => products.id),
    cantidad: integer('cantidad').notNull().default(1),
    monto: decimal('monto', { precision: 10, scale: 2 }).notNull(),
    comision: decimal('comision', { precision: 10, scale: 2 }),
    estado: orderStatusEnum('estado').notNull().default('PENDING'),
    culqiChargeId: varchar('culqi_charge_id', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    buyerIdIdx: index('orders_buyer_id_idx').on(table.buyerId),
    productIdIdx: index('orders_product_id_idx').on(table.productId),
    estadoIdx: index('orders_estado_idx').on(table.estado),
  }),
);

export const bypassAttempts = pgTable(
  'bypass_attempts',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    messageId: varchar('message_id', { length: 36 }).references(() => messages.id),
    contenido: text('contenido').notNull(),
    tipoBypass: varchar('tipo_bypass', { length: 50 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('bypass_attempts_user_id_idx').on(table.userId),
    createdAtIdx: index('bypass_attempts_created_at_idx').on(table.createdAt),
  }),
);

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  lawyerProfile: one(lawyerProfiles, {
    fields: [users.id],
    references: [lawyerProfiles.userId],
  }),
  clientConsultations: many(consultations, { relationName: 'clientConsultations' }),
  lawyerConsultations: many(consultations, { relationName: 'lawyerConsultations' }),
  sentMessages: many(messages),
  clientReviews: many(reviews, { relationName: 'clientReviews' }),
  lawyerReviews: many(reviews, { relationName: 'lawyerReviews' }),
  products: many(products),
  orders: many(orders),
  bypassAttempts: many(bypassAttempts),
}));

export const lawyerProfilesRelations = relations(lawyerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [lawyerProfiles.userId],
    references: [users.id],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  client: one(users, {
    fields: [consultations.clientId],
    references: [users.id],
    relationName: 'clientConsultations',
  }),
  lawyer: one(users, {
    fields: [consultations.lawyerId],
    references: [users.id],
    relationName: 'lawyerConsultations',
  }),
  messages: many(messages),
  review: one(reviews, {
    fields: [consultations.id],
    references: [reviews.consultationId],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  consultation: one(consultations, {
    fields: [messages.consultationId],
    references: [consultations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  consultation: one(consultations, {
    fields: [reviews.consultationId],
    references: [consultations.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
    relationName: 'clientReviews',
  }),
  lawyer: one(users, {
    fields: [reviews.lawyerId],
    references: [users.id],
    relationName: 'lawyerReviews',
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  provider: one(users, {
    fields: [products.providerId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const bypassAttemptsRelations = relations(bypassAttempts, ({ one }) => ({
  user: one(users, {
    fields: [bypassAttempts.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [bypassAttempts.messageId],
    references: [messages.id],
  }),
}));
