const { Router } = require('express')
const { createProduct, removeProduct, updateProduct, getAllProduct, getProduct,
    getNewCollections, getPopularInWomen, getRelationProducts } = require('../controllers/ProductsController')
const { register, login, addToCart, removeFromCart,
    getCart, getAllUsers, removeUser, productReview,
    deleteFromCart, getCurrentUser, updateCurrentUser, changePassword,
} = require('../controllers/UsersController')
const { createReview, getReviews, getReviewsByProduct } = require('../controllers/ReviewsController')

const { placeOrder, verifyOrder, userOrders } = require('../controllers/OrdersController')


const { fetchUser } = require('../middlewares/UserMiddlewares')
const router = Router();

//Product-admin
router.get("/", createProduct);
router.get("/getallproducts", getAllProduct);
router.get("/getproduct/:productId", getProduct);
router.post("/addproduct", createProduct);
router.put("/productupdate/:productId", updateProduct);
router.post("/removeproduct", removeProduct);
//product-client
router.get('/getnewcollections', getNewCollections);
router.get('/getpopularproducts', getPopularInWomen);
router.get('/getrelationproducts', getRelationProducts);

//User
router.post('/signup', register);
router.post('/login', login);
router.post('/addtocart', fetchUser, addToCart);
router.post('/removefromcart', fetchUser, removeFromCart);
router.post('/deletefromcart', fetchUser, deleteFromCart);
router.post('/getcart', fetchUser, getCart);
router.get('/getcurrentuser/:userId', getCurrentUser);
router.put('/updateuser/:userId', updateCurrentUser);
router.put('/changepassword/:userId', changePassword);
//admin-user
router.get('/getallusers', getAllUsers);
router.post('/removeuser', removeUser);

//Review product
router.post('/createreview', createReview);
router.get('/getreviews', getReviews);
router.get('/:productId/getreviewsbyproduct', getReviewsByProduct);



//order

router.post('/order', placeOrder);
router.post('/verify', verifyOrder);
router.post('/userorders', userOrders);
module.exports = router;