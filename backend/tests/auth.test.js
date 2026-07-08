const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '7d';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

jest.mock('../src/config/db', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return {
    pool: mockPool,
    initTables: jest.fn(),
    calcUnpaidDeduction: jest.fn(),
    buildPayslip: jest.fn(),
  };
});

jest.mock('../src/utils/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const { pool } = require('../src/config/db');
const authRoutes = require('../src/modules/auth/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Fallback 404 & error handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const validToken = jwt.sign(
  { id: 1, email: 'admin@empay.com', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const expiredToken = jwt.sign(
  { id: 1, email: 'admin@empay.com', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '0s' }
);

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{
          id: 2, full_name: 'Test User', email: 'test@empay.com',
          role: 'employee', department: null, designation: null,
          phone: null, profile_pic: null, date_joined: new Date(),
          is_active: true, created_at: new Date(),
        }],
      });

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ full_name: 'Test User', email: 'test@empay.com', password: 'Test@123', role: 'employee' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@empay.com');
  });

  it('should return 409 if email already exists', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ full_name: 'Test User', email: 'existing@empay.com', password: 'Test@123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ full_name: 'Test User', email: 'test@empay.com', password: 'Test@123' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const argon2 = require('argon2');
    const passwordHash = await argon2.hash('Test@123');

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1, email: 'admin@empay.com', password_hash: passwordHash,
        full_name: 'Admin', role: 'admin', department: null, designation: null,
        phone: null, profile_pic: null, date_joined: new Date(),
        is_active: true, created_at: new Date(),
      }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@empay.com', password: 'Test@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should return 401 with invalid credentials', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@empay.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@empay.com' });

    expect(res.status).toBe(400);
  });
});

describe('Token validation', () => {
  it('should return 401 for expired token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it('should return 401 for missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return user profile with valid token', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1, full_name: 'Admin', email: 'admin@empay.com',
        role: 'admin', department: 'Management', designation: 'System Admin',
        phone: null, profile_pic: null, date_joined: new Date(),
        is_active: true, created_at: new Date(),
      }],
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@empay.com');
  });
});

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success for valid email', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, full_name: 'Admin' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'admin@empay.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return success even for non-existent email (no enumeration)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@empay.com' });

    expect(res.status).toBe(200);
  });

  it('should return 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
  });
});
