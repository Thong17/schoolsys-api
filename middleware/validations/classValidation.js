const Joi = require('joi')

const classValidation = Joi.object({
    name: Joi.object()
        .required(),

    room: Joi.string()
        .allow(''),

    schedule: Joi.string()
        .required(),

    grade: Joi.string()
        .required(),

    description: Joi.string()
        .allow(''),

})

module.exports = { classValidation }