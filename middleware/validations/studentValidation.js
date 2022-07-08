const Joi = require('joi')

const createStudentValidation = Joi.object({
    lastName: Joi.string()
        .required(),

    firstName: Joi.string()
        .required(),

    gender: Joi.string()
        .required(),

    dateOfBirth: Joi.date()
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

const updateStudentFamilyValidation = Joi.object({
    guardian: Joi.string()
        .allow(''),

    contact: Joi.string()
        .allow(''),

    numberOfSibling: Joi.string()
        .allow(''),

    siblingAttendSchool: Joi.string()
        .allow(''),

    languages: Joi.string()
        .allow(''),

    student: Joi.string()
        .required(),
})

const updateStudentAcademyValidation = Joi.object({
    previousGrade: Joi.string()
        .allow(''),

    previousSchool: Joi.string()
        .allow(''),

    appliedGrade: Joi.string()
        .allow(''),

    student: Joi.string()
        .required(),
})

const updateStudentHealthValidation = Joi.object({
    previousTreatment: Joi.string()
        .allow(''),

    presentTreatment: Joi.string()
        .allow(''),

    allergies: Joi.string()
        .allow(''),

    student: Joi.string()
        .required(),
})

module.exports = { createStudentValidation, updateStudentAcademyValidation, updateStudentFamilyValidation, updateStudentHealthValidation }