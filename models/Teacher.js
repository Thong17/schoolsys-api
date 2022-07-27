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
        grade: {
            type: String,
        },
        subject: {
            type: String,
        },
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
        },
        tags: {
            type: String,
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

schema.pre('save', async function (next) {
    try {
        this.tags = `${this.lastName}${this.firstName}${this.ref}${this.gender}${this.email}${this.address}${this.contact}${this.grade}${this.subject}`.replace(/ /g,'')
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
        const username = this.ref
        const user = await User.create({ 
            username,
            password: `${username}@default`,
            email: this.email,
            role: '88a28069b8f93e95a08367b8'
        })
        await this.model('Teacher').findOneAndUpdate({ _id: this.id }, { authenticate: user.id })
    }
    await Image.findOneAndUpdate({ _id: this.profile }, { isActive: true })
})

module.exports = mongoose.model('Teacher', schema)