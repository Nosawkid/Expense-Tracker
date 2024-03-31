require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const session = require("express-session")
var flash = require('connect-flash');
const engine = require("ejs-mate")

const Port = process.env.PORT || 3000
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ExpenseTracker').then((res)=>{
    console.log("Db Established")
}).catch((err)=>{
    console.log(err)
})

const CustomError = require("./utils/customeError")

const sessionConfig = {
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(express.urlencoded({extended:true}))
app.use(session(sessionConfig))
app.use(flash())


app.engine("ejs",engine)
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))

app.use((req,res,next)=>{
    res.locals.success =  req.flash("success")
    res.locals.error = req.flash("error")
    next()
 })

const expenseRoutes = require("./routes/expense")
app.use("/expense",expenseRoutes)

const userRoutes = require("./routes/user")
app.use("/user",userRoutes)





app.get("/",(req,res)=>{
    res.render("index")
})



app.all("*",(req,res,next)=>{
    next(new CustomError("Page not found",404))
})

app.use((err,req,res,next)=>{
    const {status = 404,message} = err
    if(!err.message) err.message = "Something went wrong"
    res.status(status).render("error",{err})
})




















app.listen(Port,()=>{
    console.log("Server is running at " + Port)
})