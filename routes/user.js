const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const User = require("../models/user")

router.get("/",(req,res)=>{
    res.render("user/register")
})


router.post("/",async(req,res)=>{

    try {
        const {
            username,userEmail,userPassword
        } = req.body
        const existing = await User.findOne({$or:[{username},{userEmail}]})
        if(existing)
        {
           return  res.status(400).send({message:"User Already Exists"})
        }

        const salt = await bcrypt.genSalt(16)
        const hashedPassword = await bcrypt.hash(userPassword,salt)

        const newUser = new User({
            username,
            userEmail,
            userPassword:hashedPassword
        })

        await newUser.save()
        res.redirect("/")
       
    } catch (error) {
        console.log(error.message)
        res.status(400).send({message:"Something went wrong, check the console"})
    }
})


router.get("/login",(req,res)=>{
    res.render("user/login")
})


router.post("/login",async(req,res)=>{
   try {
    const {
        email,
        password
    } = req.body

    const user = await User.findAndValidate(email,password)
    if(user)
    {
        req.session.uid = user._id
        res.redirect("/expense")
    }
    else
    {
        res.redirect("/user/login")
    }

   } catch (error) {
    console.log(error.message)
    res.status(400).send({message:"Something went wrong inspect the console"})
   }
    
})

router.post("/logout",async(req,res)=>{
    try {
        req.session.uid = null
        res.redirect("/user/login")
    } catch (error) {
        console.log(error.message)
    }
})


module.exports = router