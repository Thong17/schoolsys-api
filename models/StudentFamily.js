const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        guardian: {
            type: String,
        },
        contact: {
            type: String,
        },
        numberOfSibling: {
            type: Number,
        },
        numberOfSibling: {
            type: Number,
        },
        languages: {
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

module.exports = mongoose.model('StudentFamily', schema)