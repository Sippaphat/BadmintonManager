import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  
  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://pluemp_db_user:haKuhAcSWdNMxLgX@buddi.gunuse4.mongodb.net/badminton-manager',
  
  // Authentication
  googleClientId: process.env.GOOGLE_CLIENT_ID || '634347628772-ot3d906un0ar1oq5p3b98tci67l99non.apps.googleusercontent.com',
  jwtSecret: process.env.JWT_SECRET || '123456789',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  
  // File Upload
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Rate Limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // limit each IP to 100 requests per windowMs
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
