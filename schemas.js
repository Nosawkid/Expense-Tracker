const Joi = require("joi")





module.exports.userSchema = Joi.object({
    username:Joi.string().required(),
    userEmail:Joi.string().required(),
    userPassword:Joi.string().required()
})