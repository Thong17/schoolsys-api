const Joi = require('joi')

const createStudentValidation = Joi.object({
    lastName: Joi.string()
        .required(),

    firstName: Joi.string()
        .required(),

    gender: Joi.string()
        .required(),

    birthDate: Joi.string()
        .required(),

    address: Joi.string()
        .allow(''),

    contact: Joi.string()
        .allow(''),

    email: Joi.string()
        .allow(''),

    profile: Joi.any()
})

module.exports = { createStudentValidation }