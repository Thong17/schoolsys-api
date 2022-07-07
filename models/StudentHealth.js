const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        previousTreatment: {
            type: String,
        },
        presentTreatment: {
            type: String,
        },
        allergies: {
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

module.exports = mongoose.model('StudentHealth', schema)