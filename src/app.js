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
const inboundPlanRoutes = require('./routes/inboundPlanRoute');
const outboundPlanRoutes = require('./routes/outboundPlanRoute');
const workOrderRoutes = require('./routes/workOrderRoute');
const scanRoutes = require('./routes/scanRoute');
const inventoryRoutes = require('./routes/inventoryRoute');
const dashboardRoutes = require('./routes/dashboardRoute');

// Import Middleware
const verifyToken = require('./middlewares/authMiddleware');
const authorizeRoles = require('./middlewares/roleMiddleware');

const app = express();

// settings CORS
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Route Bebas
app.use('/api/auth', authRoutes);

// Route Authorized (Admin Routes & Sebagian Supervisor)
app.use('/api/users', verifyToken, authorizeRoles('ADMIN'), userRoutes);
app.use('/api/pallets', verifyToken, authorizeRoles('ADMIN'), palletRoutes);
app.use('/api/warehouse-areas', verifyToken, authorizeRoles('ADMIN'), warehouseAreaRoutes);

// Route Master Data yang otorisasi dibedakan di level router (GET = Admin & Supervisor, POST/PUT/DELETE = Admin)
app.use('/api/pallet-types', verifyToken, palletTypeRoutes);
app.use('/api/storage-bins', verifyToken, storageBinRoutes);
app.use('/api/destinations', verifyToken, destinationRoutes);
app.use('/api/factories', verifyToken, factoryRoutes);

// Route Transaksi (otorisasi per-endpoint di route level)
app.use('/api/inbound-plans', verifyToken, inboundPlanRoutes);
app.use('/api/outbound-plans', verifyToken, outboundPlanRoutes);
app.use('/api/work-orders', verifyToken, workOrderRoutes);
app.use('/api/scans', verifyToken, scanRoutes);
app.use('/api/inventory', verifyToken, inventoryRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

// Route dasar untuk testing
app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di WMS API!' });
});

// 404 Route Not Found Handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error('UNCAUGHT ERROR:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server' });
});

module.exports = app;