const mongoose = require('mongoose')
const StudentApplication = require('./StudentApplication')

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
        totalApplied: {
            type: Number,
        },
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
        teacher: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher'
        },
        isActive: {
            type: Boolean,
            default: false
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

schema.post('find', async function (data) {
    for (const _class in data) {
        const totalApplied = await StudentApplication.count({ appliedClass: data[_class]?._id }).exec()
        data[_class]['totalApplied'] = totalApplied
    }
})

module.exports = mongoose.model('Class', schema)