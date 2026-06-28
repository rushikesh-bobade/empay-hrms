require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initTables } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const twoFactorRoutes = require('./modules/auth/twoFactor.routes');
const usersRoutes = require('./modules/users/users.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const leaveRoutes = require('./modules/leave/leave.routes');
const payrollRoutes = require('./modules/payroll/payroll.routes');
const payslipRoutes = require('./modules/payroll/payslip.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const searchRoutes = require('./modules/search/search.routes');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }
});

// Expose io to request object and globally (if needed)
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
const path = require('path');
app.use('/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// Rate limiting
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Swagger / OpenAPI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes (auth gets a stricter limiter)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/2fa', apiLimiter, twoFactorRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/attendance', apiLimiter, attendanceRoutes);
app.use('/api/leave', apiLimiter, leaveRoutes);
app.use('/api/payroll', apiLimiter, payrollRoutes);
app.use('/api/payslips', apiLimiter, payslipRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/notifications', apiLimiter, notificationsRoutes);
app.use('/api/settings', apiLimiter, settingsRoutes);
app.use('/api/search', apiLimiter, searchRoutes);

// Serve swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EmPay API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initTables();
    server.listen(PORT, () => {
      console.log(`🚀 EmPay API running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });

    // Socket connection
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
      
      // User joins their own room to receive private notifications
      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
