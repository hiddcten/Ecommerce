const Review = require('../models/Review');
const Product = require('../models/Product'); // Import mô hình Product


exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;
  
    try {
      const review = await Review.findByIdAndDelete(reviewId);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      // Cập nhật averageRating của sản phẩm
      const product = await Product.findById(review.product).populate('reviews');
      const validRatings = product.reviews.filter(r => r.rating !== null).map(r => r.rating);
      product.averageRating = validRatings.length > 0 ? (validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length) : 0;
      await product.save();
  
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
    }
  };
  
  
  
  


  exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
  
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      if (rating !== undefined) review.rating = rating;
      if (comment) review.comment = comment;
  
      await review.save();
  
      // Cập nhật averageRating của sản phẩm
      const product = await Product.findById(review.product).populate('reviews');
      const validRatings = product.reviews.filter(r => r.rating !== null).map(r => r.rating);
      product.averageRating = validRatings.length > 0 ? (validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length) : 0;
      await product.save();
  
      res.status(200).json({ success: true, message: 'Review updated successfully', review });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ success: false, message: 'Error updating review', error: error.message });
    }
  };
  
  
  
  