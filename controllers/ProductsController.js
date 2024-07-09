const Products = require('../models/ProductModel')
module.exports.getAllProduct = async (req, res) => {
    try {
        let products = await Products.find();
        if (products < 0) {
            res.status(201).json({ error: "database is empty" });
        } else {

            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ error: "database is not exist" })
    }
}

module.exports.getProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        let product = await Products.findOne({ id: productId });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: "An error occurred while fetching the product" });
    }
}


module.exports.createProduct = async (req, res) => {
    const { name, image, category, new_price, old_price, date, available } = req.body;
    
    // Kiểm tra các trường bắt buộc từ req.body
    if (!name || !image || !category || !new_price || !old_price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Tạo sản phẩm mới và lưu vào cơ sở dữ liệu
        const newProduct = await Products.create({
            name: name,
            image: image,
            category: category,
            new_price: new_price,
            old_price: old_price,
            date: date,
            available: available
        });
        
        console.log("New Product:", newProduct);

        // Trả về kết quả thành công
        res.json({
            success: true,
            name: newProduct.name // Trả về tên sản phẩm đã tạo
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}



module.exports.removeProduct = async (req, res) => {
    try {
        const product = await Products.findOneAndDelete({ id: req.body.id });
        if (product) {
            console.log("Product deleted:", product);
            res.status(200).json({ message: "Product successfully deleted", product });
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: "An error occurred while deleting the product" });
    }
};


module.exports.updateProduct = async (req, res) => {
    const { productId } = req.params;

    const {name, image, category, new_price, old_price, available } = req.body;

    // Validate input data
    if (!name || !image || !category || !new_price || !old_price) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Convert data types if necessary
        const updateData = {
            name: name,
            image: image,
            category: category,
            new_price: parseFloat(new_price),
            old_price: parseFloat(old_price),
            date: new Date(),
            available: Boolean(true)
        };

        // Find the product by the 'id' field and update it
        const updatedProduct = await Products.findOneAndUpdate({ id:productId }, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({success:"product is updated",updatedProduct});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports.getNewCollections = async (req, res) => {
    let products = await Products.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
}

module.exports.getPopularInWomen = async (req, res) => {
    let products = await Products.find({ category: "women" });
    let popularProduct = products.slice(0, 4);
    res.send(popularProduct);
}

module.exports.getRelationProducts = async (req, res) => {
    let products = await Products.find({ category: "women" });
    res.send(products);
}


