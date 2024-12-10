const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  addProduct,
  getProducts,
  getProductById,
  getProductsByCategory,
  getProductBySlug,
  deleteProduct,
  updateProduct,
  searchProducts,
  updateProductBySlug,
  getFeaturedProducts,
  getProductReviews,
  addReview
} = require('../controllers/productController');
const { getRelatedProducts } = require('../controllers/productController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.post('/add-product', upload.array('images', 5), addProduct);
router.get('/category', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.put('/slug/:slug', updateProductBySlug);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);
router.put('/:id', updateProduct);
router.post('/related-products', getRelatedProducts);
router.post('/:productId/reviews', authenticateJWT, addReview);
router.get('/:productId/reviews', getProductReviews);


module.exports = router;
