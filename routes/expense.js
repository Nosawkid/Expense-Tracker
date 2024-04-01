const express = require("express")
const router = express.Router()
const Expense = require("../models/expense.js")
const User = require("../models/user.js")
const moment = require("moment")
const requireLogin = require("../middleware/middleware.js")
const CustomError = require("../utils/customeError.js")










router.get("/",requireLogin,async(req,res,next)=>{
    try {
        const user = await User.findById(req.session.uid)

        let totalIncome = await Expense.aggregate([
            {
                $match:{
                    userId:user._id
                }
            },
            {
                $group:{
                    _id:"$userId",
                    totalInc:{$sum:"$income"}
                }
            }
        ])

        

        if(totalIncome.length > 0)
        {
            totalIncome = totalIncome[0].totalInc
        }
        else
        {
            totalIncome = 0
        }

        let totalExpense = await Expense.aggregate([
            {
                $match: {
                    userId:user._id
                }
            },
            {
                $group:{
                    _id:"userId",
                    totalExp:{$sum:"$expense"}
                }
            }
        ])

        if(totalExpense.length > 0)
        {
            totalExpense = totalExpense[0].totalExp
        }
        else
        {
            totalExpense = 0
        }


        const allIncomes = await Expense.aggregate([
            {
                $match:{
                    userId:user._id
                }
            },
            {
                $project:{
                    income:1,
                    date:"$incomeDate"
                }
            }
        ])

        const allExpences = await Expense.aggregate([
            {
                $match:{
                    userId:user._id
                }
            },
            {
                $project:{
                    expense:1,
                    date:"$expenseDate"
                }
            }
        ])

       
        
        const allTransactions = [...allIncomes,...allExpences]
        allTransactions.sort((a,b)=> b.date - a.date)
         let filteredTransactions = allTransactions.filter((f) => f.expense !== 0 && f.income!== 0)
        filteredTransactions.map((ele) => ele.date = moment(ele.date).format("DD/MM/YY (h:mm a)"))
      
        res.render("expense/index",{totalIncome,totalExpense,filteredTransactions,user})
    } catch (error) {
        console.log(error.message)
        next(new CustomError(error.message,400))
    
    }
})


router.delete("/:id",requireLogin,async(req,res)=>{
    try {
        const {id} = req.params
        const item = await Expense.findById(id)
        const user = await User.findById(req.session.uid)
        if(item.income)
        {
            user.totalAmount -= item.income
        }
        if(item.expense)
        {
            user.totalAmount += item.expense
        }

        await Expense.findByIdAndDelete(id)
        await user.save()
        req.flash("success","Data Deleted successfully")
        res.redirect("/expense")
    } catch (error) {
       console.log(error.message) 
    }
})


router.post("/:id",requireLogin, async (req, res,next) => {
    try {
        let { income, expense, incomeDate, expenseDate } = req.body;
        const {id} = req.params
        income = income === "" ? 0 : income
        expense = expense === "" ? 0 :expense

        if(income < 0)
        {
            req.flash("error","Income must be greater than 0")
            return res.redirect("/expense")
        }
        if(expense < 0)
        {
            req.flash("error","Expense must be greater than 0")
            return res.redirect("/expense")
        }

        const user = await User.findById(id)
        if(!user) return next(new CustomError("No user found",401))
         

        const newData = new Expense({
            income,
            expense,
            incomeDate,
            expenseDate,
            userId:user._id
        });

        user.totalAmount += newData.income
        user.totalAmount -= newData.expense
        
        await newData.save();
        await user.save()
        req.flash("success","Data added successfully")
        res.status(200).redirect("/expense");
    } catch (error) {
        console.log(error.message);
        res.status(400).send({ message: "Something went wrong" });
    }
});

















module.exports = router