const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        score: {
            type: Number,
            required: [true, 'Score is required!']
        },
        description: {
            type: String,
        },
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
        },
        subject: {
            type: mongoose.Schema.ObjectId,
            ref: 'Subject'
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        isDisabled: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('Score', schema)