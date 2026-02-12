import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
    // W Prisma 7 to pole nazywa się migrateUrl!
    migrateUrl: process.env.DIRECT_URL!, 
  },
});