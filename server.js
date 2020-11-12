const express = require('express');
const bodyparser = require('body-parser');
const cookieParser=require('cookie-parser');
const mongoose = require('mongoose');
const PORT = 3000 || process.env.PORT;
const conf = require('./conf/conf').get(process.env.NODE_ENV);
const apis = require('./routes/api');
const product = require('./routes/product');
const cart = require('./routes/cart');
const orders = require('./routes/orderstats');
const app = express();


//**  Middlewares   */
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(express.static(__dirname));
app.use('/files', express.static("files"));
app.use('/', apis);
app.use('/product', product);
app.use('/cart', cart);
app.use('/orders', orders);


//**  Database Connection  */
mongoose.Promise=global.Promise;
mongoose.connect(`${conf.DATABASE}`,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});






//**  Sever Starts To Listen   */
app.listen(PORT,()=>{
    console.log("Server Start to listen at port:"+PORT);
})