const Joi = require('joi')

const scoreValidation = Joi.object({
    score: Joi.number()
        .required(),

    description: Joi.string()
        .allow(''),

    student: Joi.string()
        .required(),

    subject: Joi.string()
        .required(),

})

module.exports = { scoreValidation }