const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
    // productId:{type:Number, require:true},
    createdAt: { type: Date, default: Date.now }
});

// const Review = mongoose.model('Reviews', ReviewSchema);

// module.exports = Review;
module.exports = mongoose.model('Reviews', ReviewSchema);
