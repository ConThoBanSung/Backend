const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'SoundTiFy API',
        version: '1.0.0',
        description: 'API documentation for SoundTiFy Music',
    },
    servers: [
        {
            url: 'https://backend-e154.onrender.com', // Thay đổi nếu bạn đang chạy trên cổng khác
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
