const Joi = require('joi')

const gradeValidation = Joi.object({
    name: Joi.object()
        .required(),

    level: Joi.string()
        .allow(''),

    description: Joi.string()
        .allow(''),

})

module.exports = { gradeValidation }