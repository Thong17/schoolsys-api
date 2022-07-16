const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        scores: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Score'
        }],
        class: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class'
        },
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
        },
        endedAt: {
            type: Date
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('StudentAcademy', schema)