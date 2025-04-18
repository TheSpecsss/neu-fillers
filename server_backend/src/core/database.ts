import prisma from '../lib/prisma';

class DatabaseService {
  async initialize() {
    try {
      // Test the database connection
      await prisma.$connect();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService(); 