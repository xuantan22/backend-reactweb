const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes/Routes')
const multer = require('multer')
const path = require('path')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json());
app.set('view engine', 'ejs')
const port = process.env.PORT || 3001

app.use(cors());


mongoose
    .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    socketTimeoutMS: 30000, // 30 seconds
    connectTimeoutMS: 30000 // 30 seconds
})
    .then(() => console.log('Connect to mongoDB successful!'))
    .catch((err) => console.log(err));

app.use(routes);


const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage });

// upload avatar
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar_${uniqueSuffix}${extension}`);
    }
});

const uploadAvatar = multer({ storage: avatarStorage });

//https://commerce-backend-154x.onrender.com

app.use('/images', express.static('upload/images'))
app.use('/avatars', express.static('upload/avatars'))

app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})


//avatar
app.post('/upload/avatar', uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            message: 'Không có tệp nào được tải lên',
        });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/avatars/${req.file.filename}`,
    });
});


//payment
app.post('/payment', async (req, res) => {
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    var ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
    var requestType = "payWithMethod";
    var amount = '50000';
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = '';
    var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
    //signature
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    });

    //Create the HTTPS objects
    //option for axios
    const options = {
        method: "POST",
        url: "https://test-payment.momo.vn/v2/gateway/api/create",
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }
    let result;
    try {
        result = await axios(options);
        return res.status(200).json(result.data);
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "server error"
        })
    }
});


//paypal
app.get('/paypal', (req, res) => {
    res.render('index').redirectUrl('/');
})


app.listen(port, () => console.log("server is running on port:" + port))
