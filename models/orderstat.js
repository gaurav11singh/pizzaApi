const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderStatSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    totalPizzaNumber:{
        default: 0,
        type: Number
    },
    orderPlaced: {
        default: 0,
        type: Number
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('orderstat', OrderStatSchema);