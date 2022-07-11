const mongoose = require('mongoose')
const StudentAcademy = require('./StudentAcademy')

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
        isActive: {
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
        const totalApplied = await StudentAcademy.count({ appliedClass: data[_class]?._id }).exec()
        data[_class]['totalApplied'] = totalApplied
    }
})

module.exports = mongoose.model('Class', schema)