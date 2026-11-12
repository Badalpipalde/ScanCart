import { seedDatabase } from './seedProducts';
import { disconnectDB } from '../config/db';

seedDatabase()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seeder error:', err);
    await disconnectDB();
    process.exit(1);
  });
