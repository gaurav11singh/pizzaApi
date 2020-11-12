const express = require('express');
const router = express.Router();
const multerInstance = require('./../conf/imageupload');
const OrderStat = require("./../models/orderstat");
const {auth} =require('./../authMiddleware/auth');
const productqueries = require('../dbquerrry/productdbquery');
const cartqueries = require('./../dbquerrry/cartdbquery');

const apiKey = '6430e438c6e5891b0cc2292f25cbfcd4-ba042922-8f4d96c3';
const domain = 'sandbox4b4196e7ab374fafa679f77b9a57f90e.mailgun.org';

const mailgun = require('mailgun-js')({ domain, apiKey });



router.post("/additem-cart",auth, async (req, res) => {
    const { productId } = req.body;
    const quantity = Number.parseInt(req.body.quantity);
    try {
        let cart = await cartqueries.cart();
        let productDetails = await productqueries.productById(productId);
             if (!productDetails) {
            return res.status(500).json({
                type: "Not Found",
                msg: "Invalid request"
            })
        }
        //--If cart exists ----
        if (cart) {
            //---- Check if index exists ----
            const indexFound = cart.items.findIndex(item => item.productId.id == productId);
            if (indexFound !== -1 && quantity <= 0) {
                cart.items.splice(indexFound, 1);
                if (cart.items.length == 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            else if (indexFound !== -1) {
                cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
                cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
                cart.items[indexFound].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            //---- Check if quantity is greater than 0 then add item to items ---//
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    total: parseInt(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            else {
                return res.status(400).json({
                    type: "Invalid",
                    msg: "Invalid request"
                })
            }
            let data = await cart.save();
            res.status(200).json({
                type: "success",
                mgs: "Process Successful",
                data: data
            })
        }
        //----- It creates a new cart and then adds the item to the cart that has been created   --------
        else {
            const cartData = {
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails.price * quantity),
                    price: productDetails.price
                }],
                subTotal: parseInt(productDetails.price * quantity)
            }
            cart = await cartqueries.addItem(cartData)
            let data = await cart.save();
            res.json(cart);
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something Went Wrong",
            err: err
        })
    }
});

router.get("/getitem-cart",auth, async (req, res) => {
    try {
        let cart = await cartqueries.cart()
        if (!cart) {
            return res.status(400).json({
                type: "Invalid",
                msg: "Cart not found",
            })
        }
        res.status(200).json({
            status: true,
            data: cart
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something went wrong",
            err: err
        })
    }
});

router.delete("/empty-cart",auth, async (req, res) => {
    try {
        let cart = await cartqueries.cart();
        cart.items = [];
        cart.subTotal = 0
        let data = await cart.save();
        res.status(200).json({
            type: "Success",
            mgs: "Cart has been emptied",
            data: data
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something went wrong",
            err: err
        })
    }
});

router.post("/place-order",auth, async (req, res) => {
    try {
        let cart = await cartqueries.cart()
        if (!cart) {
            return res.status(400).json({
                type: "Invalid",
                msg: "Cart not found",
            })
        }
        let productName = [];
        let totalQuantity = 0;
        for(let i=0; i<cart.items.length; i++){
            let productDetails = await productqueries.productById(cart.items[i].productId);
            productName.push(productDetails.name)
            totalQuantity += cart.items[i].quantity
        }
        let template = `<div>
                    <style>
                    h1 { color: black; }
                    </style>
    
                <h3>Pizza Order Recipit</h3>
                <h5>Customer Name:${req.user.firstname + req.user.lastname}</h5>
                <h5>Customer Contact:${req.user.address}</h5>
                <h5>Item purchased:${productName.join(" ")}</h5>
                <h5>Number of Pizzas:${totalQuantity}</h5>
                <h5>Grand Total:${cart.subTotal}</h5>
                </div>
                `;
            let html = template
            mailgun.messages().
            send({
              from: `postmaster@${domain}`,
                to: `${req.user.email}`,
                subject: 'Purchase Item Receipt',
                html,
                text: 'This is a test'
            }).
            then(async(value)=>{
                let ordersStat = await OrderStat.findOne({userId:req.user._id});
                if(ordersStat){
                       console.log(ordersStat)
                       ordersStat.totalPizzaNumber += totalQuantity;
                       ordersStat.orderPlaced += 1; 
                       let orderStatSave = await ordersStat.save();
                }else{
                    const orderStat = {
                        userId: req.user._id,
                        totalPizzaNumber:totalQuantity,
                        orderPlaced: 1
                    }
                    let orderData = await cartqueries.addStats_of_Data(orderStat)
                }
                cart.items = [];
                cart.subTotal = 0
                productName = [];
                let data = await cart.save();
                res.status(200).json({
                    type: "Success",
                    mgs: "Your Order has been palced successfully"
                })
            }).
            catch(err => console.err(err));    
    } catch (err) {
        console.log(err)
        res.status(400).json({
            type: "Invalid",
            msg: "Something went wrong",
            err: err
        })
    }
});




module.exports = router;
