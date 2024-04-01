const {userSchema} = require("../schemas")
const CustomError = require("../utils/customeError")

module.exports = (req,res,next)=>{
    if(!req.session.uid)
    {
        return res.redirect("/user/login")
    }
    next()
}



module.exports.validateUser = (req,res,next)=>{
    const {error} = userSchema.validate(req.body)
    if(error)
    {
        const message = error.details.map(el => el.message).join(",")
        throw new CustomError(message,400)
    }
    next()
}