const Product = require('../models/Product');
const slugify = require('slugify');
const Review = require('../models/Review'); 
const Order = require('../models/Order');

// Thêm sản phẩm mới
exports.addProduct = async (req, res) => {
  const { name, description, price, category, tags, variants, stock, isActive, images } = req.body;

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      tags,
      variants,
      stock,
      images: uploadedImages.length ? uploadedImages : images,
      isAvailable: isActive
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: 'Sản phẩm đã được thêm thành công!', product: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Lỗi khi thêm sản phẩm', error: error.message });
  }
};

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  console.log('Fetching products');
  try {
    const products = await Product.find();
    const updatedProducts = products.map(product => {
      let status;
      if (!product.isAvailable) {
        status = 'Unavailable';
      } else if (product.stock < 10) {
        status = 'Low Stock';
      } else {
        status = 'Available';
      }
      return { ...product._doc, status };
    });
    console.log('Products:', updatedProducts);
    res.status(200).json({ success: true, products: updatedProducts });
  } catch (error) {
    console.log('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách sản phẩm', error: error.message });
  }
};

// Lấy thông tin sản phẩm theo ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  console.log('Fetching product by ID:', id);
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.log('Product found:', product);
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log('Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
};

// Lấy sản phẩm theo category
exports.getProductsByCategory = async (req, res) => {
  const { category } = req.query;
  console.log('Category query:', category);
  try {
    // Lấy danh sách sản phẩm theo category và populate reviews để tính averageRating
    const products = await Product.find({ category: category }).populate('reviews');
    console.log('Products found:', products);

    // Tính toán averageRating cho từng sản phẩm
    const productsWithRatings = products.map(product => {
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length : 0;
      return { ...product._doc, averageRating };
    });

    res.status(200).json({ success: true, products: productsWithRatings });
  } catch (error) {
    console.log('Error fetching products by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};


// Lấy sản phẩm theo slug
exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({ slug }).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name'
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
};


// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  console.log('Deleting product ID:', id);
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    console.log('Product deleted:', product);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Cannot delete product', error: error.message });
  }
};

exports.updateProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const { name, description, price, category, tags, variants = [], images, isAvailable } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'Name must be a valid string' });
  }

  const totalStock = Array.isArray(variants) ? variants.reduce((acc, variant) => acc + parseInt(variant.stock, 10), 0) : 0;

  try {
    const updatedSlug = slugify(name, { lower: true, strict: true });

    const updatedProduct = await Product.findOneAndUpdate(
      { slug },
      {
        name,
        description,
        price,
        category,
        tags,
        variants,
        images,
        stock: totalStock, // Cập nhật giá trị stock
        isAvailable,
        slug: updatedSlug // Cập nhật slug nếu tên sản phẩm thay đổi
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product by slug:', error);
    res.status(500).json({ success: false, message: 'Cannot update product', error: error.message });
  }
};

// Lấy sản phẩm liên quan dựa trên tag
exports.getRelatedProducts = async (req, res) => {
  const { tags } = req.body;
  try {
    const products = await Product.find({ tags: { $in: tags } }).limit(4); // Giới hạn số sản phẩm liên quan
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching related products', error: error.message });
  }
};


exports.searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Keyword is required' });
    }

    const regex = new RegExp(keyword, 'i');

    const products = await Product.find({ name: { $regex: regex } })
      .select('name price images slug') // Chỉ lấy các trường cần thiết
      .limit(20); // Giới hạn số kết quả trả về (tùy chỉnh theo nhu cầu)

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    res.status(200).json({ success: true, products });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};



// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, tags, variants, stock, images, isAvailable } = req.body;
  console.log('Updating product ID:', id);
  console.log('Data received:', req.body);

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category,
      tags,
      variants,
      stock,
      images,
      isAvailable
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product updated:', updatedProduct);
    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.log('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Cannot update product', error: error.message });
  }
};


exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  const userId = req.user.userId;

  try {
    // Tìm đơn hàng của người dùng với sản phẩm cụ thể
    const order = await Order.findOne({
      userId: userId,
      'products.productId': productId
    });

    // Nếu người dùng chưa mua sản phẩm, không cho phép đánh giá
    const newReview = new Review({
      user: userId,
      product: productId,
      comment,
      rating: order ? rating : undefined
    });

    await newReview.save();

    // Cập nhật danh sách reviews của sản phẩm và tính lại averageRating
    const product = await Product.findById(productId);
    product.reviews.push(newReview._id);
    const allRatings = await Review.find({ _id: { $in: product.reviews } });
    const ratings = allRatings.filter(r => r.rating !== null).map(r => r.rating);
    product.averageRating = ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length) : 0;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Error adding review', error: error.message });
  }
};




exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ product: productId }).populate('user', 'name'); // Populate để lấy thông tin người dùng
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
};





exports.getFeaturedProducts = async (req, res) => {
  try {
    console.log("Fetching featured products...");
    const products = await Product.find().sort({ averageRating: -1 }).limit(10); // Lấy 10 sản phẩm có rating cao nhất
    console.log("Featured products found:", products);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching featured products:', error); // In ra lỗi để kiểm tra
    res.status(500).json({ error: 'Error fetching featured products' });
  }
};



