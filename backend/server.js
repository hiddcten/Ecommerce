const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

require('dotenv').config();
require('./src/config/passport');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/productRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require('./src/routes/userRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const promotionRoutes = require('./src/routes/promotionRoutes');
const orderRoutes = require('./src/routes/orderRoutes'); 
const reviewRoutes = require('./src/routes/reviewRoutes');
const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadRoutes); // Đảm bảo rằng tuyến đường này được cấu hình đúng
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Tạo đường dẫn tĩnh cho thư mục upload
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
