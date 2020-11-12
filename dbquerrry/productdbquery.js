const Product = require("../models/menuitem");

exports.products = async () => {
    const products = await Product.find();
    return products;
};

exports.createProduct = async payload => {
    const newProduct = await Product.create(payload);
    return newProduct
}

exports.productById = async id => {
    const product = await Product.findById(id);
    return product;
}