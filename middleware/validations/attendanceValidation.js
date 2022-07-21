const Joi = require('joi')

const checkInValidation = Joi.object({
    user: Joi.string()
        .required(),

    class: Joi.string()
        .required(),
})

const permissionValidation = Joi.object({
    user: Joi.string()
        .required(),

    class: Joi.string()
        .required(),

    attendance: Joi.string()
        .allow(null),

    permissionType: Joi.string()
        .allow(''),

    checkedOut: Joi.date()
        .allow(null),

    description: Joi.string()
        .allow(''),
})

module.exports = { checkInValidation, permissionValidation }