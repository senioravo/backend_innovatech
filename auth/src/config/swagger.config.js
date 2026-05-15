const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InnovaTech Auth API',
      version: '1.0.0',
      description: 'API de autenticación y autorización para InnovaTech',
      contact: {
        name: 'InnovaTech Team',
        email: 'info@innovatech.cl'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://localhost:8080',
        description: 'API Gateway'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al hacer login'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            rol: {
              type: 'string',
              enum: ['gestor', 'profesional', 'directivo'],
              description: 'Rol del usuario en el sistema'
            },
            creado_en: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario'
            }
          }
        },
        RegistroRequest: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol'],
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan.perez@innovatech.cl'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña (mínimo 8 caracteres)',
              example: 'Password123!'
            },
            rol: {
              type: 'string',
              enum: ['gestor', 'profesional', 'directivo'],
              description: 'Rol del usuario',
              example: 'gestor'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan.perez@innovatech.cl'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña',
              example: 'Password123!'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            },
            usuario: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre del rol'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del rol'
            },
            permisos: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de permisos del rol'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            mensaje: {
              type: 'string',
              description: 'Mensaje de error'
            },
            error: {
              type: 'string',
              description: 'Detalle del error'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Archivos donde están las anotaciones de Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
