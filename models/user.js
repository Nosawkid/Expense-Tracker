const mongoose = require("mongoose")
const Schema = mongoose.Schema
const validator = require("validator")
const bcrypt = require("bcrypt")



const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    userEmail:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate:{
            validator:function(value){
                return validator.isEmail(value)
            },
            message: props => `${props.value} is not a valid Email`
        }
    },
    userPassword:{
        type:String,
        required:true
    },
    totalAmount:{
        type:Number,
        default:0,
        
    }
})

userSchema.statics.findAndValidate = async function(username,password)
{
    const user = await this.findOne({ $or: [{ username}, { userEmail:username }] });
    if(!user)
    {
        return false
    }
    const isValidPassword = await bcrypt.compare(password,user.userPassword)
    return isValidPassword ? user : false
}


module.exports = mongoose.model("schemaUser",userSchema)