const express = require("express")
const router = express.Router()
const Expense = require("../models/expense.js")
const User = require("../models/user.js")
const moment = require("moment")
const requireLogin = require("../middleware/middleware.js")
const mongoose = require("mongoose")
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





router.post("/:id",requireLogin, async (req, res,next) => {
    try {
        let { income, expense, incomeDate, expenseDate } = req.body;
        const {id} = req.params
        income = income === "" ? 0 : income
        expense = expense === "" ? 0 :expense

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
        res.status(200).redirect("/expense");
    } catch (error) {
        console.log(error.message);
        res.status(400).send({ message: "Something went wrong" });
    }
});
















module.exports = router