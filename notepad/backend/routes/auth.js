const express= require('express');
const User= require('../models/User');
const router= express.Router();
const {body, validationResult}= require('express-validator');
const bcrypt= require('bcryptjs');
var jwt=require('jsonwebtoken');
var fetchUser=require('../middle-ware/fetchUser');

const JWT_SECRET='niitaisgreta$h';

// making credentials
router.post('/createuser',[
   body('name','Enter a valid name').isLength({min:3}),
   body('email', 'Enter a valid email').isEmail(),
   body('password','Enter password of atleast 5 characters').isLength({min :5}),

], async (req, res)=>{
   let success= false;
   const errors=validationResult(req);
  if(!errors.isEmpty()){
   return res.status(400).json({success, errors: errors.array()});
   
  }
  // check if any user exists with the same email
  try{
  let user= await User.findOne({email:req.body.email});
  if (user){
   return res.status(400).json({success, error: "Sorry! A user with this email already exists"});

  }
  const salt= await bcrypt.genSalt(10);
  const secPass= await bcrypt.hash(req.body.password,salt);
  user= await User.create({
   name: req.body.name,
   password: secPass,
   email: req.body.email,
  });
   const data={
      user:{
         id:user.id
      }
   }
   const authtoken= jwt.sign(data, JWT_SECRET);
   success= true;
   res.json({success, authtoken})}
   catch(error){
      console.error(error.message);
      res.status(500).send("Error Occured!");
   }
})

//authenticate a user login
router.post('/login',[
   body('email', 'Enter a valid email').isEmail(),
   body('password', 'Password cannot be blank').exists(),

], async (req, res)=>{
   let success= false;
   const errors=validationResult(req);
  if(!errors.isEmpty()){
   return res.status(400).json({errors: errors.array()});
  }

  const{email,password}=req.body;
  try{
   let user= await User.findOne({email});
   if(!user){
      success=false
      return res.status(400).json({error:"Please login with correct credentials"});
   }
   const passwordCompare= await bcrypt.compare(password,user.password);
   if(!passwordCompare){
      success=false
      return res.status(400).json({success,error:"Please login with correct credentials"});
   }
   const data={
      user:{
         id:user.id
      }
   }
   const authtoken=jwt.sign(data,JWT_SECRET);
   success=true;
   res.json({success, authtoken})
  }catch(error){
   console.error(error.message);
   res.status(500).send("Internal Server Error");
}



})

// getin logged user
router.post('/getUser', fetchUser, async (req, res)=>{
try{
   userId=req.user.id;
   const user= await User.findById(userId).select("-password")
   res.send(user)

}catch(error){
   console.error(error.message);
   res.status(500).send("Internal Server Error");

}
})
module.exports=router