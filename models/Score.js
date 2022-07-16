const mongoose = require('mongoose')
const StudentAcademy = require('./StudentAcademy')

const schema = mongoose.Schema(
    {
        score: {
            type: Number,
            required: [true, 'Score is required!']
        },
        description: {
            type: String,
        },
        academy: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentAcademy'
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

schema.post('save', async function () {
    const academy = await StudentAcademy.findById(this.academy)
    academy.scores.push(this._id)
    academy.save()
})

module.exports = mongoose.model('Score', schema)