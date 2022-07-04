const mongoose = require('mongoose')
const Image = require('./Image')

const schema = mongoose.Schema(
    {
        ref: {
            type: String,
            required: [true, 'Ref is required!']
        },
        lastName: {
            type: String,
            required: [true, 'LastName is required!']
        },
        firstName: {
            type: String,
            required: [true, 'FirstName is required!']
        },
        gender: {
            type: String,
            required: [true, 'Gender is required!']
        },
        birthDate: {
            type: Date
        },
        address: {
            type: String,
        },
        contact: {
            type: String,
        },
        email: {
            type: String,
        },
        profile: {
            type: mongoose.Schema.ObjectId,
            ref: 'Image'
        },
        scores: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Score'
        }],
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

schema.pre('save', async function (next) {
    try {
        if (this.profile) {
            await Image.findOneAndUpdate({ _id: this.profile }, { isActive: false })
        }
        next()
    } catch (err) {
        next(err)
    }
})

schema.post('save', async function () {
    await Image.findOneAndUpdate({ _id: this.profile }, { isActive: true })
})

module.exports = mongoose.model('Student', schema)