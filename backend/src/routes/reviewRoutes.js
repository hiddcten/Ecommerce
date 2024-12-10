const express = require('express');
const { deleteReview, updateReview } = require('../controllers/reviewController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.delete('/:reviewId', authenticateJWT, deleteReview);
router.put('/:reviewId', authenticateJWT, updateReview);

module.exports = router;
