const Joi = require('joi')

const checkInValidation = Joi.object({
    user: Joi.string()
        .required(),

    class: Joi.string()
        .required(),
})

module.exports = { checkInValidation }