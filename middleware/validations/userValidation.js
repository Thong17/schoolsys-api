const Joi = require('joi')

const createUserValidation = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
        
    role: Joi.string()
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    privilege: Joi.object()
        .required()
})

const updateUserValidation = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
        
    role: Joi.string()
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .allow(''),

    privilege: Joi.object()
        .required()
})

module.exports = { createUserValidation, updateUserValidation }