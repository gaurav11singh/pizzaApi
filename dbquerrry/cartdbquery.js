const Cart = require("./../models/cart");
const OrderStat = require("./../models/orderstat");


exports.cart = async () => {
    const carts = await Cart.find().populate({
        path: "items.productId",
        select: "name price total"
    });;
    return carts[0];
};
exports.addItem = async payload => {
    const newItem = await Cart.create(payload);
    return newItem;
}

exports.addStats_of_Data = async payload =>{
    const addNewData = await OrderStat.create(payload)
    return addNewData;
}

exports.orderDataStats = async () => {
    const dataStats = await OrderStat.find();
    return dataStats;
};