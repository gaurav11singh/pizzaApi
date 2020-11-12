const express = require('express');
const router = express.Router();
const multerInstance = require('./../conf/imageupload');
const {auth} =require('./../authMiddleware/auth');
const productqueries = require('../dbquerrry/productdbquery')


router.get('/menuitems',auth,async (req,res)=>{
    
    try {
        let products = await productqueries.products();
        res.status(200).json({
            status: true,
            data: products,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err,
            status: false,
        })
    }
});


router.post("/add-new-item",auth,multerInstance.upload.single('image'), async (req, res) => {
    if(req.user.role == true){
        try {
            let payload = {
                name: req.body.name,
                price: req.body.price,
                image: req.file.path,
                size:req.body.size
            }
            let product = await productqueries.createProduct({
                ...payload
            });
            res.status(200).json({
                status: true,
                data: product,
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({
                error: err,
                status: false,
            })
        }
    }else {
        res.status(401).json({
            type: "Unauthorized",
            msg: "Invalid credentials"
        })
    }
    
    
});




module.exports = router;
