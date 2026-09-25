import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Order Service API',
        description: 'Order Service API',
        version: "1.0.0"
    },
    host: 'localhost:6002',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/order.route.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);