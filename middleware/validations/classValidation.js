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

    teacher: Joi.string()
        .allow('')
        .allow(null),

    monitor: Joi.string()
        .allow('')
        .allow(null),

    description: Joi.string()
        .allow(''),

})

module.exports = { classValidation }