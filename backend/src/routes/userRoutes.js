const express = require('express');
const { getUsers, getUserPersonalInfo, getUserAddresses,getUserRole, getUserRewards, getUserTransactions } = require('../controllers/userController');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const User = require('../models/User');  // Đảm bảo rằng User model được import
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // hoặc 'bcrypt' tùy vào gói bạn cài đặt

router.get('/', getUsers);

router.get('/personal-info', authenticateJWT, getUserPersonalInfo);
router.put('/personal-info', authenticateJWT, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = fullName;
    user.email = email;
    user.phoneNumber = phone;

    await user.save();

    res.status(200).json({ message: 'Personal info updated successfully' });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ message: 'Error updating personal info', error: error.message });
  }
});

router.put('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    // Log user và thông tin đầu vào
    console.log('User ID:', req.user.userId);
    console.log('Current Password:', currentPassword);
    console.log('New Password:', newPassword);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    console.log('Current password match:', isMatch);

    if (!isMatch) {
      console.log('Current password is incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('Password updated successfully for user:', user.email);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
});



router.get('/addresses', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});


router.post('/addresses', authenticateJWT, async (req, res) => {
  try {
    const { name, phone, region, fullAddress } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.push({ name, phone, region, fullAddress });
    await user.save();

    res.status(200).json({ message: 'Address added successfully', address: user.addresses[user.addresses.length - 1] });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
});



router.get('/rewards', authenticateJWT, getUserRewards);
router.get('/transactions', authenticateJWT, getUserTransactions);

router.get('/loyalty-points', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ loyaltyPoints: user.loyaltyPoints });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Error fetching loyalty points', error: error.message });
  }
});

router.put('/:id/userStatus', async (req, res) => {
  console.log("Entering userStatus route");
  let { id } = req.params;
  const { isActive } = req.body;

  console.log(`Request received to update user status. ID: ${id}, isActive: ${isActive}`);

  try {
    id = new mongoose.Types.ObjectId(id);  // Handle ObjectId conversion
    console.log("Before findById:", id);
    const user = await User.findById(id);
    console.log("After findById:", user); 

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    console.log('User status updated successfully');
    res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/role', authenticateJWT, getUserRole);

router.put('/addresses/:addressId', authenticateJWT, async (req, res) => {
  try {
    const { name, phone, region, fullAddress } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    address.name = name;
    address.phone = phone;
    address.region = region;
    address.fullAddress = fullAddress;

    await user.save();

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});


router.delete('/addresses/:addressId', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter(address => address._id.toString() !== req.params.addressId);
    await user.save();

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});




module.exports = router;
