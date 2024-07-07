const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    username: {
        type: String,
    },
    birthday: {
        type: Date,
    },
    gender: {
        type: String,
    },
    phonenumber: {
        type: String,
    },
    role: {
        type: String,
        default:'user'
    },
    cartData: {
        type: Object,
        default:{}
    },
    date: {
        type: Date,
        default: Date.now,
    }
},{minimize:false});

module.exports = mongoose.model('Users', UserSchema);
