import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/database/schema';
import { hashPassword } from '../src/common/utils/jwt.util';

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  console.log('Seeding database...');

  const adminHash = hashPassword('Admin123!');
  const [admin] = await db.insert(schema.users).values({ email: 'admin@midefensaperu.com', passwordHash: adminHash, role: 'ADMIN', firstName: 'Admin', lastName: 'MDP' }).returning().onConflictDoNothing();
  console.log('Admin created:', admin?.email);

  const clientHash = hashPassword('Client123!');
  const [client] = await db.insert(schema.users).values({ email: 'cliente@test.com', passwordHash: clientHash, role: 'CLIENT', firstName: 'Juan', lastName: 'García' }).returning().onConflictDoNothing();
  console.log('Client created:', client?.email);

  const lawyerHash = hashPassword('Lawyer123!');
  const [lawyer] = await db.insert(schema.users).values({ email: 'abogado@test.com', passwordHash: lawyerHash, role: 'LAWYER', firstName: 'María', lastName: 'López' }).returning().onConflictDoNothing();
  if (lawyer) {
    const [lp] = await db.insert(schema.lawyerProfiles).values({ userId: lawyer.id, colegiatura: 'CAL-12345', especialidades: ['Derecho Civil', 'Derecho Laboral'], precio: '150.00', descripcion: 'Abogada con 10 años de experiencia en derecho civil y laboral', aniosExperiencia: 10, ciudad: 'Lima', distrito: 'Miraflores', estado: 'VERIFIED' }).returning().onConflictDoNothing();
    console.log('Lawyer profile created:', lp?.colegiatura);
  }

  const providerHash = hashPassword('Provider123!');
  const [provider] = await db.insert(schema.users).values({ email: 'proveedor@test.com', passwordHash: providerHash, role: 'PROVIDER', firstName: 'Carlos', lastName: 'Vendedor' }).returning().onConflictDoNothing();
  if (provider) {
    await db.insert(schema.products).values([
      { providerId: provider.id, nombre: 'Manual de Derecho Civil Peruano', descripcion: 'Libro esencial para abogados', precio: '89.90', categoria: 'LIBROS', stock: 50 },
      { providerId: provider.id, nombre: 'Toga de Abogado Premium', descripcion: 'Toga de alta calidad', precio: '299.00', categoria: 'ROPA', stock: 20 },
    ]).onConflictDoNothing();
    console.log('Products created');
  }

  console.log('\nSeed completed!\nCredentials:');
  console.log('Admin: admin@midefensaperu.com / Admin123!');
  console.log('Client: cliente@test.com / Client123!');
  console.log('Lawyer: abogado@test.com / Lawyer123!');
  console.log('Provider: proveedor@test.com / Provider123!');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
