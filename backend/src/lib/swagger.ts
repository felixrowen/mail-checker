import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VeriMail API',
      version: '1.0.0',
      description: 'API documentation for VeriMail - Email domain verification service'
    },
    servers: [
      {
        url: 'https://verimail.codeprephub.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Bad request' },
            '409': { description: 'Email already exists' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' }
          }
        }
      },
      '/check': {
        post: {
          tags: ['Domain Check'],
          summary: 'Check domain email configuration',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['domain'],
                  properties: {
                    domain: { type: 'string', format: 'uri' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Domain check completed' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/check/mail-echo': {
        post: {
          tags: ['Domain Check'],
          summary: 'Check mail echo configuration',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['domain'],
                  properties: {
                    domain: { type: 'string', format: 'uri' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Mail echo check completed' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/check/history': {
        get: {
          tags: ['Domain Check'],
          summary: 'Get check history',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Check history retrieved' },
            '401': { description: 'Unauthorized' }
          }
        }
      }
    }
  },
  apis: [] // No need to scan files
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'VeriMail API Documentation',
    swaggerOptions: {
      url: '/api-docs.json'
    }
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 