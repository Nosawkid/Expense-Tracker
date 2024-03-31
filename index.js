require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const session = require("express-session")

const Port = process.env.PORT || 3000
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ExpenseTracker').then((res)=>{
    console.log("Db Established")
}).catch((err)=>{
    console.log(err)
})


app.use(express.urlencoded({extended:true}))
app.use(session({secret:process.env.SECRET_KEY}))



app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

const expenseRoutes = require("./routes/expense")
app.use("/expense",expenseRoutes)

const userRoutes = require("./routes/user")
app.use("/user",userRoutes)





app.get("/",(req,res)=>{
    res.render("index")
})
























app.listen(Port,()=>{
    console.log("Server is running at " + Port)
})