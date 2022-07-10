const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        name: {
            type: Object,
            required: [true, 'Name is required!']
        },
        room: {
            type: String,
        },
        schedule: {
            type: String,
            required: [true, 'Schedule is required!']
        },
        students: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
        }],
        grade: {
            type: mongoose.Schema.ObjectId,
            ref: 'Grade'
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('Class', schema)