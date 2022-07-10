const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        name: {
            type: Object,
            index: {
                unique: true,
            },
            required: [true, 'Name is required!']
        },
        level: {
            type: String,
        },
        subjects: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Subject'
        }],
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        description: {
            type: String,
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

module.exports = mongoose.model('Grade', schema)