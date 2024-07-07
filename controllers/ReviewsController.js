const ReviewSchema = require('../models/ReviewModel')
const UserSchema = require('../models/UserModel')
const ProductSchema = require('../models/ProductModel')

// Tạo review mới
exports.createReview = async (req, res) => {
    try {
        const { userId, productId, rating, comment } = req.body;
        // const {id} = req.params();
        // Kiểm tra user và product có tồn tại hay không
        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const product = await ProductSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Tạo review mới
        const review = new ReviewSchema({
            rating,
            comment,
            user: userId,
            product: productId,
            // productId:id
        });

        await review.save();
        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// Lấy tất cả các review
exports.getReviews = async (req, res) => {
    try {
        const reviews = await ReviewSchema.find().populate('user').populate('product');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product_id = await ProductSchema.findOne({ id: productId });

        const reviews = await ReviewSchema.find({ product: product_id._id }).populate('user').populate('product');
        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
        }
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
