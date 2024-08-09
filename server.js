const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12723699',
  password: 'YiUUq9FJcj',
  database: 'sql12723699',
  port: 3306
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

const jwtSecret = crypto.randomBytes(32).toString('hex');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'hoangkhadooo@gmail.com',
    pass: 'nohs bsgm nmzx njqv'
  }
});

const sendVerificationEmail = (email, token) => {
  const url = `https://backend-e154.onrender.com/verify-email?token=${token}`;
  const mailOptions = {
    from: 'SecGei Music',
    to: email,
    subject: 'Email Verification',
    html: `<p>Please click this link to verify your email: <a href="${url}">${url}</a></p>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const isPasswordStrong = (password) => {
  const minLength = 10;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).send('Unauthorized');

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).send('Forbidden');
    req.user = user;
    next();
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

app.use('/search', require('./routes/search'));
app.use('/audio', require('./routes/audio'));

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!isPasswordStrong(password)) {
    return res.status(400).send({ message: 'Password is not strong enough. It should include at least 10 characters, 1 uppercase letter, 1 special character, and 1 number.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  const sql = 'INSERT INTO users (username, email, password, verificationToken, verificationTokenExpires, isVerified) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [username, email, hashedPassword, verificationToken, verificationTokenExpires, false], (err, result) => {
    if (err) {
      console.error('Error occurred during registration:', err);
      return res.status(500).send({ message: 'Server error' });
    }
    sendVerificationEmail(email, verificationToken);
    res.status(201).send({ message: 'User registered' });
  });
});

app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  const sql = 'SELECT * FROM users WHERE verificationToken = ? AND verificationTokenExpires > ?';
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err) {
      console.error('Error verifying email:', err);
      return res.status(500).send({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }
    const user = results[0];
    const updateSql = 'UPDATE users SET isVerified = true, verificationToken = NULL, verificationTokenExpires = NULL WHERE id = ?';
    db.query(updateSql, [user.id], (err, result) => {
      if (err) {
        console.error('Error updating user verification status:', err);
        return res.status(500).send({ message: 'Server error' });
      }
      res.send('Email verified successfully');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(400).send('User not found');

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).send('Invalid password');
    if (!user.isVerified) return res.status(400).send('Email not verified');

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  });
});

app.get('/profile', authenticateToken, (req, res) => {
  const sql = 'SELECT id, username, email, avatar FROM users WHERE id = ?';
  db.query(sql, [req.user.userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('User not found');
    const user = results[0];
    if (user.avatar) {
      user.avatar = `https://backend-e154.onrender.com/${user.avatar}`;
    }
    res.json(user);
  });
});

app.post('/change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const sql = 'SELECT password FROM users WHERE id = ?';
  db.query(sql, [req.user.userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('User not found');

    const user = results[0];
    if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(400).send('Old password is incorrect');

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).send({ message: 'New password is not strong enough. It should include at least 10 characters, 1 uppercase letter, 1 special character, and 1 number.' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashedNewPassword, req.user.userId], (err, result) => {
      if (err) return res.status(500).send('Server error');
      res.send('Password changed successfully');
    });
  });
});

app.post('/upload-avatar', authenticateToken, upload.single('avatar'), (req, res) => {
  const avatarUrl = `uploads/${req.file.filename}`;
  const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
  db.query(sql, [avatarUrl, req.user.userId], (err, result) => {
    if (err) return res.status(500).send('Server error');
    res.json({ avatar: `https://backend-e154.onrender.com/${avatarUrl}` });
  });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(404).send('Email not found');

    const user = results[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    const updateSql = 'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE id = ?';
    db.query(updateSql, [resetToken, resetTokenExpires, user.id], (err, result) => {
      if (err) return res.status(500).send('Server error');

      const resetUrl = `https://backend-e154.onrender.com/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: 'SecGei Music',
        to: email,
        subject: 'Password Reset',
        html: `<p>Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send('Server error');
        }
        res.send('Password reset email sent');
      });
    });
  });
});

app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  const sql = 'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > ?';
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(400).send('Invalid or expired token');

    const user = results[0];
    res.send(`
      <form action="/reset-password" method="POST">
        <input type="hidden" name="token" value="${token}" />
        <label for="password">New Password:</label>
        <input type="password" name="password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);
  });
});

app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  const sql = 'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > ?';
  db.query(sql, [token, Date.now()], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(400).send('Invalid or expired token');

    const user = results[0];

    if (!isPasswordStrong(password)) {
      return res.status(400).send({ message: 'Password is not strong enough. It should include at least 10 characters, 1 uppercase letter, 1 special character, and 1 number.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const updateSql = 'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?';
    db.query(updateSql, [hashedPassword, user.id], (err, result) => {
      if (err) return res.status(500).send('Server error');
      res.send('Password reset successfully');
    });
  });
});

app.post('/playlist', authenticateToken, (req, res) => {
  const { songId, title, description, thumbnail, url } = req.body;

  // Dynamically fetch playlistId based on authenticated user's context
  const playlistIdSql = 'SELECT id FROM playlists WHERE userId = ? LIMIT 1';
  db.query(playlistIdSql, [req.user.userId], (err, results) => {
    if (err) {
      console.error('Error fetching playlistId:', err);
      return res.status(500).send('Server error');
    }
    
    if (results.length === 0) {
      console.error('Playlist not found for user:', req.user.userId);
      return res.status(404).send('Playlist not found');
    }

    const playlistId = results[0].id;

    const sql = 'INSERT INTO playlist_songs (playlistId, songId, title, description, thumbnail, url) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [playlistId, songId, title, description, thumbnail, url], (err, result) => {
      if (err) {
        console.error('Error adding song to playlist:', err);
        return res.status(500).send('Server error');
      }
      res.status(201).send('Song added to playlist');
    });
  });
});

app.get('/playlists', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM playlists WHERE userId = ?';
  db.query(sql, [req.user.userId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.json(results);
  });
});

app.get('/playlist/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM playlist_songs WHERE playlistId = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.json(results);
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
