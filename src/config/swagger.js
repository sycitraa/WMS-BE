const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WMS API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi API untuk Warehouse Management System (WMS)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  
  apis: [path.join(__dirname, '../routes/*.js')], 
  
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;