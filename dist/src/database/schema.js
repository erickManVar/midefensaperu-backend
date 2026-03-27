"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bypassAttemptsRelations = exports.ordersRelations = exports.productsRelations = exports.reviewsRelations = exports.messagesRelations = exports.consultationsRelations = exports.lawyerProfilesRelations = exports.usersRelations = exports.bypassAttempts = exports.orders = exports.products = exports.reviews = exports.messages = exports.consultations = exports.lawyerProfiles = exports.users = exports.productCategoryEnum = exports.orderStatusEnum = exports.consultationStatusEnum = exports.lawyerStatusEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['CLIENT', 'LAWYER', 'PROVIDER', 'ADMIN']);
exports.lawyerStatusEnum = (0, pg_core_1.pgEnum)('lawyer_status', [
    'PENDING_VERIFICATION',
    'VERIFIED',
    'SUSPENDED',
]);
exports.consultationStatusEnum = (0, pg_core_1.pgEnum)('consultation_status', [
    'PENDING_PAYMENT',
    'HELD',
    'IN_PROGRESS',
    'COMPLETED',
    'DISPUTED',
    'CANCELLED',
    'RELEASED',
]);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', [
    'PENDING',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
]);
exports.productCategoryEnum = (0, pg_core_1.pgEnum)('product_category', [
    'LIBROS',
    'ROPA',
    'ACCESORIOS',
    'VIAJES',
    'TECNOLOGIA',
    'OTROS',
]);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    role: (0, exports.userRoleEnum)('role').notNull().default('CLIENT'),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    avatarUrl: (0, pg_core_1.text)('avatar_url'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    emailVerified: (0, pg_core_1.boolean)('email_verified').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    emailIdx: (0, pg_core_1.uniqueIndex)('users_email_idx').on(table.email),
    roleIdx: (0, pg_core_1.index)('users_role_idx').on(table.role),
}));
exports.lawyerProfiles = (0, pg_core_1.pgTable)('lawyer_profiles', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    userId: (0, pg_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    colegiatura: (0, pg_core_1.varchar)('colegiatura', { length: 50 }).notNull().unique(),
    especialidades: (0, pg_core_1.jsonb)('especialidades').$type().notNull().default([]),
    precio: (0, pg_core_1.decimal)('precio', { precision: 10, scale: 2 }).notNull(),
    descripcion: (0, pg_core_1.text)('descripcion'),
    aniosExperiencia: (0, pg_core_1.integer)('anios_experiencia').notNull().default(0),
    distrito: (0, pg_core_1.varchar)('distrito', { length: 100 }),
    ciudad: (0, pg_core_1.varchar)('ciudad', { length: 100 }).notNull().default('Lima'),
    estado: (0, exports.lawyerStatusEnum)('estado').notNull().default('PENDING_VERIFICATION'),
    rating: (0, pg_core_1.decimal)('rating', { precision: 3, scale: 2 }).notNull().default('0'),
    totalCases: (0, pg_core_1.integer)('total_cases').notNull().default(0),
    totalReviews: (0, pg_core_1.integer)('total_reviews').notNull().default(0),
    fotoUrl: (0, pg_core_1.text)('foto_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('lawyer_profiles_user_id_idx').on(table.userId),
    estadoIdx: (0, pg_core_1.index)('lawyer_profiles_estado_idx').on(table.estado),
    ciudadIdx: (0, pg_core_1.index)('lawyer_profiles_ciudad_idx').on(table.ciudad),
    precioIdx: (0, pg_core_1.index)('lawyer_profiles_precio_idx').on(table.precio),
    ratingIdx: (0, pg_core_1.index)('lawyer_profiles_rating_idx').on(table.rating),
    colegiaturaIdx: (0, pg_core_1.uniqueIndex)('lawyer_profiles_colegiatura_idx').on(table.colegiatura),
}));
exports.consultations = (0, pg_core_1.pgTable)('consultations', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    clientId: (0, pg_core_1.varchar)('client_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    lawyerId: (0, pg_core_1.varchar)('lawyer_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    monto: (0, pg_core_1.decimal)('monto', { precision: 10, scale: 2 }).notNull(),
    comision: (0, pg_core_1.decimal)('comision', { precision: 10, scale: 2 }),
    estado: (0, exports.consultationStatusEnum)('estado').notNull().default('PENDING_PAYMENT'),
    escrowId: (0, pg_core_1.varchar)('escrow_id', { length: 255 }),
    culqiChargeId: (0, pg_core_1.varchar)('culqi_charge_id', { length: 255 }),
    descripcion: (0, pg_core_1.text)('descripcion'),
    autoReleaseAt: (0, pg_core_1.timestamp)('auto_release_at'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    disputeReason: (0, pg_core_1.text)('dispute_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    clientIdIdx: (0, pg_core_1.index)('consultations_client_id_idx').on(table.clientId),
    lawyerIdIdx: (0, pg_core_1.index)('consultations_lawyer_id_idx').on(table.lawyerId),
    estadoIdx: (0, pg_core_1.index)('consultations_estado_idx').on(table.estado),
    autoReleaseIdx: (0, pg_core_1.index)('consultations_auto_release_idx').on(table.autoReleaseAt),
}));
exports.messages = (0, pg_core_1.pgTable)('messages', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    consultationId: (0, pg_core_1.varchar)('consultation_id', { length: 36 })
        .notNull()
        .references(() => exports.consultations.id, { onDelete: 'cascade' }),
    senderId: (0, pg_core_1.varchar)('sender_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    contenido: (0, pg_core_1.text)('contenido').notNull(),
    bloqueado: (0, pg_core_1.boolean)('bloqueado').notNull().default(false),
    contenidoOriginal: (0, pg_core_1.text)('contenido_original'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    consultationIdIdx: (0, pg_core_1.index)('messages_consultation_id_idx').on(table.consultationId),
    senderIdIdx: (0, pg_core_1.index)('messages_sender_id_idx').on(table.senderId),
}));
exports.reviews = (0, pg_core_1.pgTable)('reviews', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    consultationId: (0, pg_core_1.varchar)('consultation_id', { length: 36 })
        .notNull()
        .unique()
        .references(() => exports.consultations.id),
    clientId: (0, pg_core_1.varchar)('client_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    lawyerId: (0, pg_core_1.varchar)('lawyer_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    rating: (0, pg_core_1.integer)('rating').notNull(),
    comentario: (0, pg_core_1.text)('comentario'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    lawyerIdIdx: (0, pg_core_1.index)('reviews_lawyer_id_idx').on(table.lawyerId),
    clientIdIdx: (0, pg_core_1.index)('reviews_client_id_idx').on(table.clientId),
    consultationIdIdx: (0, pg_core_1.uniqueIndex)('reviews_consultation_id_idx').on(table.consultationId),
}));
exports.products = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    providerId: (0, pg_core_1.varchar)('provider_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    nombre: (0, pg_core_1.varchar)('nombre', { length: 255 }).notNull(),
    descripcion: (0, pg_core_1.text)('descripcion'),
    precio: (0, pg_core_1.decimal)('precio', { precision: 10, scale: 2 }).notNull(),
    categoria: (0, exports.productCategoryEnum)('categoria').notNull(),
    stock: (0, pg_core_1.integer)('stock').notNull().default(0),
    imagen: (0, pg_core_1.text)('imagen'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    providerIdIdx: (0, pg_core_1.index)('products_provider_id_idx').on(table.providerId),
    categoriaIdx: (0, pg_core_1.index)('products_categoria_idx').on(table.categoria),
    precioIdx: (0, pg_core_1.index)('products_precio_idx').on(table.precio),
    isActiveIdx: (0, pg_core_1.index)('products_is_active_idx').on(table.isActive),
}));
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    buyerId: (0, pg_core_1.varchar)('buyer_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    productId: (0, pg_core_1.varchar)('product_id', { length: 36 })
        .notNull()
        .references(() => exports.products.id),
    cantidad: (0, pg_core_1.integer)('cantidad').notNull().default(1),
    monto: (0, pg_core_1.decimal)('monto', { precision: 10, scale: 2 }).notNull(),
    comision: (0, pg_core_1.decimal)('comision', { precision: 10, scale: 2 }),
    estado: (0, exports.orderStatusEnum)('estado').notNull().default('PENDING'),
    culqiChargeId: (0, pg_core_1.varchar)('culqi_charge_id', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => ({
    buyerIdIdx: (0, pg_core_1.index)('orders_buyer_id_idx').on(table.buyerId),
    productIdIdx: (0, pg_core_1.index)('orders_product_id_idx').on(table.productId),
    estadoIdx: (0, pg_core_1.index)('orders_estado_idx').on(table.estado),
}));
exports.bypassAttempts = (0, pg_core_1.pgTable)('bypass_attempts', {
    id: (0, pg_core_1.varchar)('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v4)()),
    userId: (0, pg_core_1.varchar)('user_id', { length: 36 })
        .notNull()
        .references(() => exports.users.id),
    messageId: (0, pg_core_1.varchar)('message_id', { length: 36 }).references(() => exports.messages.id),
    contenido: (0, pg_core_1.text)('contenido').notNull(),
    tipoBypass: (0, pg_core_1.varchar)('tipo_bypass', { length: 50 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)('bypass_attempts_user_id_idx').on(table.userId),
    createdAtIdx: (0, pg_core_1.index)('bypass_attempts_created_at_idx').on(table.createdAt),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    lawyerProfile: one(exports.lawyerProfiles, {
        fields: [exports.users.id],
        references: [exports.lawyerProfiles.userId],
    }),
    clientConsultations: many(exports.consultations, { relationName: 'clientConsultations' }),
    lawyerConsultations: many(exports.consultations, { relationName: 'lawyerConsultations' }),
    sentMessages: many(exports.messages),
    clientReviews: many(exports.reviews, { relationName: 'clientReviews' }),
    lawyerReviews: many(exports.reviews, { relationName: 'lawyerReviews' }),
    products: many(exports.products),
    orders: many(exports.orders),
    bypassAttempts: many(exports.bypassAttempts),
}));
exports.lawyerProfilesRelations = (0, drizzle_orm_1.relations)(exports.lawyerProfiles, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.lawyerProfiles.userId],
        references: [exports.users.id],
    }),
}));
exports.consultationsRelations = (0, drizzle_orm_1.relations)(exports.consultations, ({ one, many }) => ({
    client: one(exports.users, {
        fields: [exports.consultations.clientId],
        references: [exports.users.id],
        relationName: 'clientConsultations',
    }),
    lawyer: one(exports.users, {
        fields: [exports.consultations.lawyerId],
        references: [exports.users.id],
        relationName: 'lawyerConsultations',
    }),
    messages: many(exports.messages),
    review: one(exports.reviews, {
        fields: [exports.consultations.id],
        references: [exports.reviews.consultationId],
    }),
}));
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    consultation: one(exports.consultations, {
        fields: [exports.messages.consultationId],
        references: [exports.consultations.id],
    }),
    sender: one(exports.users, {
        fields: [exports.messages.senderId],
        references: [exports.users.id],
    }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviews, ({ one }) => ({
    consultation: one(exports.consultations, {
        fields: [exports.reviews.consultationId],
        references: [exports.consultations.id],
    }),
    client: one(exports.users, {
        fields: [exports.reviews.clientId],
        references: [exports.users.id],
        relationName: 'clientReviews',
    }),
    lawyer: one(exports.users, {
        fields: [exports.reviews.lawyerId],
        references: [exports.users.id],
        relationName: 'lawyerReviews',
    }),
}));
exports.productsRelations = (0, drizzle_orm_1.relations)(exports.products, ({ one, many }) => ({
    provider: one(exports.users, {
        fields: [exports.products.providerId],
        references: [exports.users.id],
    }),
    orders: many(exports.orders),
}));
exports.ordersRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one }) => ({
    buyer: one(exports.users, {
        fields: [exports.orders.buyerId],
        references: [exports.users.id],
    }),
    product: one(exports.products, {
        fields: [exports.orders.productId],
        references: [exports.products.id],
    }),
}));
exports.bypassAttemptsRelations = (0, drizzle_orm_1.relations)(exports.bypassAttempts, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.bypassAttempts.userId],
        references: [exports.users.id],
    }),
    message: one(exports.messages, {
        fields: [exports.bypassAttempts.messageId],
        references: [exports.messages.id],
    }),
}));
//# sourceMappingURL=schema.js.map