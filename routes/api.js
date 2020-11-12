const express = require('express');
const router = express.Router();
const User=require('./../models/user');
const {auth} =require('./../authMiddleware/auth');


router.get('/',(req,res)=>{
    res.status(200).send(`Welcome to pizza world`);
});

// adding new user (sign-up route)
router.post('/register',(req,res)=>{
    const newuser=new User(req.body);
    
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "Password does not match"});
    
    User.findOne({email:newuser.email},(err,user)=>{
        if(user) return res.status(400).json({ auth : false, message :"Email is already present"});
 
        newuser.save((err,doc)=>{
            console.log(doc)
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                succes:true,
                user : doc
            });
        });
    });
 });


router.post('/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},(err,user)=>{
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});


// logged in user
// router.get('/profile',auth,(req,res)=>{
//     res.json({
//         isAuth: true,
//         id: req.user._id,
//         email: req.user.email,
//         name: req.user.firstname + req.user.lastname
        
//     })
// });


//logout user
router.get('/logout',auth,(req,res)=>{
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 




module.exports = router