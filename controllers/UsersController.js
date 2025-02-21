const UserSchema = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { default: Stripe } = require('stripe');
const { default: orderModel } = require('../models/OrderModel');


//đăng ký tài khoản
module.exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    let check = await UserSchema.findOne({ email: email });
    if (check) {
        return res.status(400).json({ success: false, error: "user already exists" });
    }
    if(password.length<8){
        return res.json({success:false, message:"please enter strong password"})
    }
  
        const passwordhash = await bcrypt.hash(password, 10);
        console.log(passwordhash);
        const user = await UserSchema.create({
            name: name,
            email: email,
            password: passwordhash,
        
        })
        await user.save();
        const userId = user._id;
        const data = {
            user: {
                id: user._id
            }
        }

        const token = jwt.sign(data, 'secret_token');
        res.json({ success: true, token, userId });
    }

// }

//đăng nhập tài khoản
module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    let user = await UserSchema.findOne({ email: email });
    if (user) {
        let userId = user._id;
        let passwordCompare = await bcrypt.compare(password, user.password);
        if (passwordCompare) {
            const data = {
                user: {
                    id: user._id
                }
            }
            const token = jwt.sign(data, "secret_token");
            res.json({ success: true, token, userId });
        } else {
            res.json({ success: false, error: "Wrong Password" });
        }
    } else {
        res.json({ success: false, error: "email is not exist" });
    }
}


//thêm sản phẩm vào giỏ hàng
module.exports.addToCart = async (req, res) => {
    // console.log(req.body);
    try {
        let userData = await UserSchema.findOne({ _id: req.user.id });
    let cartData = await userData.cartData;
    if(!cartData[req.body.itemId]){
        cartData[req.body.itemId] = 1;
    }else{
        cartData[req.body.itemId] += 1;
    }
    await UserSchema.findOneAndUpdate({ _id: req.user.id }, { cartData:cartData })
    res.json({success:true, message: "Added To Cart" });
    } catch (error) {
        console.log(error);
        res.json({success:false, message:"Error"});
    }
}

//giảm số lượng sản phẩm trong giỏ hàng
module.exports.removeFromCart = async (req, res) => {
    // console.log(req.body);
    try {
        let userData = await UserSchema.findOne({ _id: req.user.id });
        userData.cartData[req.body.itemId] -= 1;
        await UserSchema.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
        res.json({ message: "Removed" });
    } catch {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

//xóa sản phẩm khỏi giỏ hàng
module.exports.deleteFromCart = async (req, res) => {
    try {
        let userData = await UserSchema.findOne({ _id: req.user.id });

        if (userData.cartData[req.body.itemId]) {
            delete userData.cartData[req.body.itemId];
        }

        await UserSchema.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: userData.cartData }
        );

        res.json({ message: "Item deleted from cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


//lấy giỏ hàng của người dùng
module.exports.getCart = async (req, res) => {
    let userData = await UserSchema.findOne({ _id: req.user.id });
    res.json(userData.cartData);
}

//lấy user đăng nhập hiện tại
module.exports.getCurrentUser = async (req, res) => {
    try {
        const {userId} = req.params; 

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid User ID');
        }
        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

//update thông tin user hiện tại
module.exports.updateCurrentUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email, username, image, birthday, gender, phonenumber, cartData } = req.body;

    try {
        const updateUser = {};
        if (name) updateUser.name = name;
        if (email) updateUser.email = email;
        if (image) updateUser.image = image;
        if (username) updateUser.username = username;
        if (birthday) updateUser.birthday = new Date(birthday);
        if (gender) updateUser.gender = gender;
        if (phonenumber) updateUser.phonenumber = phonenumber;
        if (cartData) updateUser.cartData = cartData;

        const updatedUser = await UserSchema.findByIdAndUpdate(
            userId,
            { $set: updateUser },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ success: "User is updated", updatedUser });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};






//admin-controller 
//lấy tất cả user từ database
module.exports.getAllUsers = async (req, res) => {
    try {
        let allUsers = await UserSchema.find();
        if (allUsers < 0) {
            res.status(201).json({ error: "userdatabase is empty" })
        } else {
            res.json(allUsers);
        }
    } catch (error) {
        res.status(500).json({ error: "database is not exist" })
    }
}

//xóa sản phẩm khỏi database
module.exports.removeUser = async (req, res) => {
    try {
        const user = await UserSchema.findOneAndDelete({ _id: req.body.id });
        if (user) {
            console.log("user deleted:", user);
            res.status(200).json({ message: "User is deleted", user });
        } else {
            res.status(404).json({ error: "User not found " });
        }
    } catch (error) {
        console.error('Error deleting user', error);
        res.status(500).json({ error: "An error occurred while deleting the user" })
    }
};

module.exports.changePassword = async (req, res) => {
    try {

    } catch (error) {

    }
}

//đặt hàng các sản phẩm trong giỏ hàng
module.exports.placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:3000"
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        await newOrder.save();
        await UserModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 80
            },
            quantity: item.quantity
        }))
        line_items.push({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 80
            },
            quantity: 1
        })
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        })

        res.json({ sucess: true, session_url: session.url })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "error" })
    }

}
