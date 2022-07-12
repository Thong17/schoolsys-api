const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        previousGrade: {
            type: String,
        },
        previousSchool: {
            type: String,
        },
        appliedClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class'
        },
        currentClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class'
        },
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('StudentAcademy', schema)