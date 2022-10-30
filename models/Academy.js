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
        students: {
            type: Array
        },
        subjects: {
            type: Array
        },
        scores: {
            type: Array
        },
        grade: {
            type: Object,
            required: [true, 'Name is required!']
        },
        createdBy: {
            type: String
        },
        teacher: {
            type: String
        },
        monitor: {
            type: String
        },
        startedAt: {
            type: Date
        },
        endedAt: {
            type: Date
        }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

module.exports = mongoose.model('Academy', schema)