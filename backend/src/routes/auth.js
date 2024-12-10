const express = require('express');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService'); // Import dịch vụ gửi email
const authenticateJWT = require('../middleware/authenticateJWT'); // Import middleware xác thực

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('Email đã tồn tại:', normalizedEmail);
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Original password: ${password}`);
    console.log(`Hashed password for ${normalizedEmail}: ${hashedPassword}`);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    await newUser.save();
    console.log('User registered successfully:', normalizedEmail);

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase();

  console.log(`Login attempt for email: ${trimmedEmail}`);
  console.log(`Login attempt with password: ${password}`);

  try {
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log("User not found:", trimmedEmail);
      return res.status(400).json({ message: 'Email không tồn tại' });
    }

    console.log(`Stored hashed password: ${user.password}`);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password entered: ${password}`);
    console.log(`Password match for ${trimmedEmail}: ${isMatch}`);

    if (!isMatch) {
      console.log("Invalid credentials");
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị cấm' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, isActive: user.isActive },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("User logged in successfully:", user.email);
    console.log("User name to return:", user.name);

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: { name: user.name, email: user.email, role: user.role, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập' });
  }
});


// Route để lấy thông tin người dùng hiện tại
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route để lấy user role
router.get('/role', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Đăng nhập bằng Google
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (user) {
      // Nếu người dùng đã tồn tại, cập nhật ID Google của họ nếu chưa có
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Tạo tài khoản mới mà không yêu cầu mật khẩu
      user = new User({ name, email, googleId, password: '' });
      await user.save();
    }

    // Tạo JWT Token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Login successful', token: jwtToken, user });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Updating password for ${email}. New password: ${newPassword}, Hashed password: ${hashedPassword}`);
    user.password = hashedPassword;
    await user.save();

    console.log(`Updated password for ${email}`);
    console.log(`New hashed password: ${hashedPassword}`);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found in system' });
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(20).toString('hex');

    // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token hết hạn sau 1 giờ
    await user.save();

    // Tạo URL reset mật khẩu
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    // Gửi email reset mật khẩu
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

module.exports = router;
