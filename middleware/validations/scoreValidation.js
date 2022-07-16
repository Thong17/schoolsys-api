const Joi = require('joi')

const scoreValidation = Joi.object({
    score: Joi.number()
        .required(),

    description: Joi.string()
        .allow(''),

    academy: Joi.string()
        .required(),

    student: Joi.string()
        .required(),

    subject: Joi.string()
        .required(),

})

module.exports = { scoreValidation }