// src/docs/paths/auth.path.ts
export const authPaths = {
  '/auth/signup': {
    post: {
      tags: ['User'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignupRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '409': {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['User'],
      summary: 'Authenticate user and get token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/auth/profile': {
    get: {
      tags: ['User'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Profile retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileResponse' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['User'],
      summary: 'Logout (invalidate token on client side)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/auth/change-password': {
    post: {
      tags: ['User'],
      summary: 'Change password for authenticated user',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password changed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['User'],
      summary: 'Request password reset link',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Reset link sent (if email exists)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
      },
    },
  },
  '/auth/reset-password': {
    post: {
      tags: ['User'],
      summary: 'Reset password using token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password reset successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': {
          description: 'Invalid or expired token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
};