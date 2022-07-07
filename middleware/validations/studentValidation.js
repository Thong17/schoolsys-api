const Joi = require('joi')

const createStudentValidation = Joi.object({
    lastName: Joi.string()
        .required(),

    firstName: Joi.string()
        .required(),

    gender: Joi.string()
        .required(),

    dateOfBirth: Joi.string()
        .required(),

    placeOfBirth: Joi.string()
        .allow(''),

    nationality: Joi.string()
        .allow(''),

    address: Joi.string()
        .allow(''),

    contact: Joi.string()
        .allow(''),

    profile: Joi.any()
})

module.exports = { createStudentValidation }