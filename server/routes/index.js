import authRoutes from './auth.js';
import groupRoutes from './groups.js';
import playerRoutes from './players.js';
import scheduleRoutes from './schedules.js';

export default function setupRoutes(app) {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/groups', playerRoutes); // Players are nested under groups
  app.use('/api/groups', scheduleRoutes); // Schedules are nested under groups
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });
}
