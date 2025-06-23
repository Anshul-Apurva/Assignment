const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const spamRoutes = require('./routes/spam');
const { verifyToken } = require('./middleware/auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/search', verifyToken, searchRoutes);
app.use('/api/spam', verifyToken, spamRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
