import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    // Zostawiamy tylko główny URL. To wystarczy, żeby build przeszedł.
    url: process.env.DATABASE_URL!,
  },
});