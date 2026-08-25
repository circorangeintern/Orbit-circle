
// swagger.ts
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { paths } from './docs/paths'; 

const router = express.Router();

const swaggerServerUrl =  'http://localhost:3002';

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CareerMap API Documentation',
      version: '1.0.0',
      description: 'API for CareerMap platform',
    },
    servers: [
      {
        url: swaggerServerUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Local Development Server',
      },
    ],
    tags: [
      { name: 'User', description: 'User related endpoints' },
      { name: 'Admin', description: 'Admin related endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY',
        },
      },
        schemas: {
        // Request bodies
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'full_name'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'Secure123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'Secure123' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password' },
            newPassword: { type: 'string', format: 'password', minLength: 6 },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string', description: 'Reset token received via email' },
            newPassword: { type: 'string', format: 'password', minLength: 6 },
          },
        },
        // Common responses
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            accessToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation completed successfully' },
          },
        },
        ProfileResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            // add other fields as needed
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error (e.g., missing fields, invalid format)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
    paths, // 👈 injected here
  },
  apis: [], // 👈 empty – we no longer scan files
};

const swaggerSpec = swaggerJSDoc(options);

// Endpoint to get raw JSON spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;