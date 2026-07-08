const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EmPay HRMS API',
      version: '1.0.0',
      description: 'REST API documentation for EmPay HRMS – Employee Payroll & HR Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './src/modules/auth/*.js',
    './src/modules/users/*.js',
    './src/modules/payroll/*.js',
    './src/modules/attendance/*.js',
    './src/modules/leave/*.js',
    './src/modules/dashboard/*.js',
    './src/modules/notifications/*.js',
    './src/modules/settings/*.js',
    './src/modules/search/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
