const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        previousGrade: {
            type: String,
        },
        previousSchool: {
            type: String,
        },
        appliedGrade: {
            type: String,
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