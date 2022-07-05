const mongoose = require('mongoose')
const Image = require('./Image')
const User = require('./User')

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
            required: [true, 'Email is required!'],
            index: {
                unique: true
            }
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
        authenticate: {
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
    if (!this.authenticate) {
        const username = `${this.lastName}.${this.firstName}`.toLowerCase()
        const user = await User.create({ 
            username,
            password: `${username}@123`,
            email: this.email,
            role: 'a7668e2a9ed48842855643cf'
        })
        await this.model('Student').findOneAndUpdate({ _id: this.id }, { authenticate: user.id })
    }
    await Image.findOneAndUpdate({ _id: this.profile }, { isActive: true })
})

module.exports = mongoose.model('Student', schema)