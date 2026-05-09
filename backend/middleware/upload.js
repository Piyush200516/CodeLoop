const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'upi');
ensureDir(UPLOAD_ROOT);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_ROOT);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '');
    const safeExt = ext ? ext.toLowerCase() : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `screenshot-${unique}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only JPG/PNG/WEBP images are allowed'));
  },
});

module.exports = { upload };

