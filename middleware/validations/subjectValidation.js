const Joi = require('joi')

const subjectValidation = Joi.object({
    name: Joi.object()
        .required(),

    level: Joi.string()
        .allow(''),

    passScore: Joi.number()
        .required(),

    fullScore: Joi.number()
        .required(),

    description: Joi.string()
        .allow(''),

    grade: Joi.string()
        .required(),

    teacher: Joi.string()
        .allow(''),
})

module.exports = { subjectValidation }