import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { databaseService } from './core/database';
import { authService } from './core/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import templateRoutes from './routes/templates';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(authService.getPassport().initialize());

// Static files
app.use('/uploads', express.static('uploads'));

// Initialize services
const initializeServices = async () => {
  try {
    await databaseService.initialize();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initializeServices();
}); 