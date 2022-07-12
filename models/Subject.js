const mongoose = require('mongoose')
const Grade = require('./Grade')

const schema = mongoose.Schema(
    {
        name: {
            type: Object,
            required: [true, 'Name is required!']
        },
        passScore: {
            type: Number,
            required: [true, 'Full Score is required!']
        },
        fullScore: {
            type: Number,
            required: [true, 'Full Score is required!']
        },
        description: {
            type: String,
        },
        grade: {
            type: mongoose.Schema.ObjectId,
            ref: 'Grade'
        },
        teacher: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher'
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

schema.post('save', async function () {
    const grade = await Grade.findById(this.grade)
    grade.subjects.push(this._id)
    grade.save()
})

module.exports = mongoose.model('Subject', schema)