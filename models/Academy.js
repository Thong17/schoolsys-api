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
        subjects: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Subject'
        }],
        scores: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Score'
        }],
        grade: {
            type: Object,
            required: [true, 'Name is required!']
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        teacher: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher'
        },
        monitor: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
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