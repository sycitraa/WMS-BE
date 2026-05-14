const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import Library Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const swaggerUiOptions = {
    swaggerOptions: {
        persistAuthorization: true,
    },
};

// Import Routes
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const warehouseAreaRoutes = require('./routes/warehouseAreaRoute');
const storageBinRoutes = require('./routes/storageBinRoute');
const palletTypeRoutes = require('./routes/palletTypeRoute');
const palletRoutes = require('./routes/palletRoute');
const destinationRoutes = require('./routes/destinationRoute');
const factoryRoutes = require('./routes/factoryRoute');

// Import Middleware
const verifyToken = require('./middlewares/authMiddleware');
const authorizeRoles = require('./middlewares/roleMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Route Bebas
app.use('/api/auth', authRoutes);

// Route Authorized (Admin Routes)
app.use('/api/users', verifyToken, authorizeRoles('ADMIN'), userRoutes);
app.use('/api/pallets', verifyToken, authorizeRoles('ADMIN'), palletRoutes);
app.use('/api/pallet-types', verifyToken, authorizeRoles('ADMIN'), palletTypeRoutes);
app.use('/api/storage-bins', verifyToken, authorizeRoles('ADMIN'), storageBinRoutes);
app.use('/api/warehouse-areas', verifyToken, authorizeRoles('ADMIN'), warehouseAreaRoutes);
app.use('/api/destinations', verifyToken, authorizeRoles('ADMIN'), destinationRoutes);
app.use('/api/factories', verifyToken, authorizeRoles('ADMIN'), factoryRoutes);

// Route dasar untuk testing
app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di WMS API!' });
});

module.exports = app;