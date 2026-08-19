const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'EventPulse API',
      version: '1.0.0',
      description:
        'RESTful API for EventPulse — event management, authentication, registrations, announcements, and categories.'
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      },
      {
        url: 'https://12345-event-pulse-z3el.vercel.app',
        description: 'Production server'
      }
    ],

    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management'
      },
      {
        name: 'Events',
        description: 'Event management'
      },
      {
        name: 'Registrations',
        description: 'Event registrations'
      },
      {
        name: 'Announcements',
        description: 'Event announcements'
      },
      {
        name: 'Categories',
        description: 'Event categories'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },

      schemas: {
        UserRegister: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'Nourseen Elsayed'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'nourseen@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'Password123'
            }
          }
        },

        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'nourseen@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Password123'
            }
          }
        },

        Event: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Tech Conference 2026'
            },
            description: {
              type: 'string',
              example: 'A conference about modern technology.'
            },
            category: {
              type: 'string',
              example: '64f123456789abcdef123456'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-15T10:00:00.000Z'
            },
            city: {
              type: 'string',
              example: 'Cairo'
            },
            venue: {
              type: 'string',
              example: 'Cairo Convention Center'
            },
            capacity: {
              type: 'number',
              minimum: 1,
              example: 100
            }
          }
        },

        EventUpdate: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Updated Tech Conference'
            },
            description: {
              type: 'string',
              example: 'Updated event description.'
            },
            category: {
              type: 'string',
              example: '64f123456789abcdef123456'
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-20T10:00:00.000Z'
            },
            city: {
              type: 'string',
              example: 'Cairo'
            },
            venue: {
              type: 'string',
              example: 'New Cairo Convention Center'
            },
            capacity: {
              type: 'number',
              minimum: 1,
              example: 150
            }
          }
        },

        Registration: {
          type: 'object',
          required: ['eventId'],
          properties: {
            eventId: {
              type: 'string',
              example: '64f123456789abcdef123456'
            }
          }
        },

        Announcement: {
          type: 'object',
          required: ['eventId', 'text'],
          properties: {
            eventId: {
              type: 'string',
              example: '64f123456789abcdef123456'
            },
            text: {
              type: 'string',
              example: 'The event starts at 10:00 AM.'
            }
          }
        },

        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Technology'
            },
            description: {
              type: 'string',
              example: 'Technology and programming events.'
            }
          }
        }
      }
    },

    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserRegister'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully'
            },
            400: {
              description: 'Validation error or email already registered'
            }
          }
        }
      },

      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserLogin'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful'
            },
            400: {
              description: 'Invalid email or password'
            }
          }
        }
      },

      '/api/events': {
        get: {
          tags: ['Events'],
          summary: 'Get all events',
          responses: {
            200: {
              description: 'List of events'
            }
          }
        },

        post: {
          tags: ['Events'],
          summary: 'Create a new event',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Event'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Event created successfully'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Admin role required'
            },
            400: {
              description: 'Validation error'
            }
          }
        }
      },

      '/api/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Get event by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              example: '64f123456789abcdef123456'
            }
          ],
          responses: {
            200: {
              description: 'Event found'
            },
            404: {
              description: 'Event not found'
            }
          }
        },

        patch: {
          tags: ['Events'],
          summary: 'Update an event',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              example: '64f123456789abcdef123456'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EventUpdate'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Event updated successfully'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Admin role required'
            },
            404: {
              description: 'Event not found'
            }
          }
        },

        delete: {
          tags: ['Events'],
          summary: 'Delete an event',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              example: '64f123456789abcdef123456'
            }
          ],
          responses: {
            200: {
              description: 'Event deleted successfully'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Admin role required'
            },
            404: {
              description: 'Event not found'
            }
          }
        }
      },

      '/api/registrations': {
        post: {
          tags: ['Registrations'],
          summary: 'Register for an event',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Registration'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Registration created successfully'
            },
            401: {
              description: 'Authentication required'
            },
            400: {
              description: 'Invalid event ID or registration error'
            }
          }
        }
      },

      '/api/registrations/my': {
        get: {
          tags: ['Registrations'],
          summary: 'Get my registrations',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of current user registrations'
            },
            401: {
              description: 'Authentication required'
            }
          }
        }
      },

      '/api/registrations/{id}': {
        delete: {
          tags: ['Registrations'],
          summary: 'Cancel my registration',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              example: '64f123456789abcdef123456'
            }
          ],
          responses: {
            200: {
              description: 'Registration cancelled successfully'
            },
            401: {
              description: 'Authentication required'
            },
            404: {
              description: 'Registration not found'
            }
          }
        }
      },

      '/api/announcements': {
        post: {
          tags: ['Announcements'],
          summary: 'Create an announcement',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Announcement'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Announcement created successfully'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Admin role required'
            },
            400: {
              description: 'Validation error'
            }
          }
        }
      },

      '/api/announcements/{eventId}': {
        get: {
          tags: ['Announcements'],
          summary: 'Get announcements for an event',
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              example: '64f123456789abcdef123456'
            }
          ],
          responses: {
            200: {
              description: 'Announcement history'
            },
            404: {
              description: 'Event not found'
            }
          }
        }
      },

      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories',
          responses: {
            200: {
              description: 'List of categories'
            }
          }
        },

        post: {
          tags: ['Categories'],
          summary: 'Create a category',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Category'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Category created successfully'
            },
            401: {
              description: 'Authentication required'
            },
            403: {
              description: 'Admin role required'
            },
            400: {
              description: 'Category name is required'
            }
          }
        }
      }
    }
  },

  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;