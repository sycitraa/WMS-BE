const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// 1. Import library Swagger dan Konfigurasinya
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const swaggerUiOptions = {
    swaggerOptions: {
        persistAuthorization: true,
    },
};

// 2. Import Routes
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const warehouseAreaRoutes = require('./routes/warehouseAreaRoute'); // Import route untuk warehouse area
const storageBinRoutes = require('./routes/storageBinRoute'); // Import route untuk storage bin
const palletTypeRoutes = require('./routes/palletTypeRoute'); // Import route untuk pallet type

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 3. Pasang Swagger menggunakan konfigurasi dari file config/swagger.js
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// 4. Daftarkan Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouse-areas', warehouseAreaRoutes);
app.use('/api/storage-bins', storageBinRoutes);
app.use('/api/pallet-types', palletTypeRoutes);

// Route dasar untuk testing
app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di WMS API!' });
});

// PENTING: Jangan ada app.listen() di sini karena sudah ditangani oleh index.js

module.exports = app;