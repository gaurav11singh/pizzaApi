const express = require('express');
const router = express.Router();
const {auth} =require('./../authMiddleware/auth');
const cartRepository = require('./../dbquerrry/cartdbquery');


//-------- All Placed Order Details ----------//
router.get('/dashboard',auth,async(req,res)=>{
    if(req.user.role == true){
        try {
            let products = await cartRepository.orderDataStats();
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
    }else{
        res.status(401).json({
            type: "Unauthorized",
            msg: "Invalid credentials"
        });
    }
    
})












module.exports = router;