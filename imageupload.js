const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/Routes');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;

app.use(cors());

mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Kết nối đến MongoDB thành công!'))
    .catch((err) => {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });

app.use(routes);

// Đảm bảo thư mục upload tồn tại
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const avatarDir = './upload/avatars';
const productDir = './upload/products';
ensureDirectoryExistence(avatarDir);
ensureDirectoryExistence(productDir);

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar_${uniqueSuffix}${extension}`);
    }
});

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `product_${uniqueSuffix}${extension}`);
    }
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadProduct = multer({ storage: productStorage });

app.use('/images/avatars', express.static(avatarDir));
app.use('/images/products', express.static(productDir));

app.post('/upload/avatar', uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            message: 'Không có tệp nào được tải lên',
        });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/avatars/${req.file.filename}`,
    });
});

app.post('/upload/product', uploadProduct.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            message: 'Không có tệp nào được tải lên',
        });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/products/${req.file.filename}`,
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã xảy ra lỗi!');
});

app.listen(port, () => console.log(`Server đang chạy trên cổng: ${port}`));
