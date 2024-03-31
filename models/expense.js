const e = require("express")
const mongoose = require("mongoose")
const {Schema} = mongoose




const expenseSchema = new Schema({
    income:{
        type:Number,
        min:0,
        default:0
    },
    incomeDate:{
        type:Date,
        default: Date.now
    },
    expense:{
        type:Number,
        min:0,
        default:0
    },
    expenseDate:{
        type:Date,
        default:Date.now
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"schemaUser",
        required:true
    }
   
})



module.exports = mongoose.model("schemaExpense",expenseSchema)