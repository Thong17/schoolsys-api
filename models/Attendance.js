const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        checkedIn: {
            type: Date,
            default: Date.now
        },
        checkedOut: {
            type: Date,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        class: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class'
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        isReset: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('Attendance', schema)