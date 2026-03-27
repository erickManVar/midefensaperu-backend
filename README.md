# MiDefensaPeru Backend

Marketplace de abogados en Perú — API Backend

## Stack
- NestJS con Fastify adapter
- Drizzle ORM + PostgreSQL (Neon)
- BullMQ (Redis) para jobs asíncronos
- Culqi para pagos con escrow
- Resend para emails
- TypeScript strict + Zod

## Setup Rápido

### 1. Clonar y configurar
```bash
git clone git@github.com:erickManVar/midefensaperu-backend.git
cd midefensaperu-backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Base de datos y Redis local
```bash
docker-compose up -d
# O usar Neon: https://neon.tech
```

### 3. Ejecutar migraciones
```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed de datos de prueba
```bash
npm run seed
```

### 5. Iniciar servidor
```bash
npm run start:dev    # Desarrollo
npm run build        # Build producción
npm start            # Producción
```

## Variables de Entorno
Ver `.env.example` para descripción de cada variable.

## Endpoints API

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET  /api/v1/auth/me (JWT required)

### Lawyers
- GET  /api/v1/lawyers/search?especialidad=&ciudad=&precioMin=&precioMax=
- GET  /api/v1/lawyers/:id
- POST /api/v1/lawyers/profile (LAWYER role)
- GET  /api/v1/lawyers/my/profile (LAWYER role)
- PUT  /api/v1/lawyers/my/profile (LAWYER role)

### Consultations (Escrow)
- POST /api/v1/consultations (CLIENT)
- POST /api/v1/consultations/:id/pay (CLIENT)
- POST /api/v1/consultations/:id/confirm (CLIENT)
- POST /api/v1/consultations/:id/dispute (CLIENT)
- GET  /api/v1/consultations/my
- GET  /api/v1/consultations/:id

### Chat
- POST /api/v1/chat/:consultationId
- GET  /api/v1/chat/:consultationId

### Reviews
- POST /api/v1/reviews (CLIENT, after COMPLETED consultation)
- PUT  /api/v1/reviews/:id (within 24h)
- GET  /api/v1/reviews/lawyer/:lawyerId

### Lex Store
- GET  /api/v1/store/products (LAWYER, PROVIDER, ADMIN)
- POST /api/v1/store/products (PROVIDER)
- PUT  /api/v1/store/products/:id (PROVIDER)
- POST /api/v1/store/products/:id/buy (LAWYER verified)

### Admin
- GET  /api/v1/admin/lawyers/pending
- POST /api/v1/admin/lawyers/:id/verify
- POST /api/v1/admin/lawyers/:id/suspend
- GET  /api/v1/admin/bypass-attempts
- GET  /api/v1/admin/consultations/disputed
- POST /api/v1/admin/consultations/:id/resolve

## Arquitectura
- **Escrow Flow**: Pago retenido → Abogado da servicio → Cliente confirma → 80% al abogado, 20% comisión
- **Chat Shield**: Detecta y bloquea números, emails, WhatsApp, redes sociales
- **Cache**: Perfiles de abogados cacheados 5 min con node-cache
- **Auto-release**: Cron job libera escrow si no hay confirmación en 7 días
- **Rate Limiting**: 100 requests/min por IP
