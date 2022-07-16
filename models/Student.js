const mongoose = require('mongoose')
const Image = require('./Image')
const User = require('./User')
const StudentApplication = require('./StudentApplication')
const StudentFamily = require('./StudentFamily')
const StudentHealth = require('./StudentHealth')

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
        dateOfBirth: {
            type: Date
        },
        placeOfBirth: {
            type: String,
        },
        nationality: {
            type: String,
        },
        address: {
            type: String,
        },
        contact: {
            type: String,
        },
        profile: {
            type: mongoose.Schema.ObjectId,
            ref: 'Image'
        },
        currentAcademy: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentAcademy'
        },
        academies: [{
            type: mongoose.Schema.ObjectId,
            ref: 'StudentAcademy'
        }],
        application: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentApplication'
        },
        family: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentFamily'
        },
        health: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentHealth'
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
        const username = this.ref
        const user = await User.create({ 
            username,
            password: `${username}@default`,
            email: this.email,
            role: 'a7668e2a9ed48842855643cf'
        })
        await this.model('Student').findOneAndUpdate({ _id: this.id }, { authenticate: user.id })
    }
    if (!this.application) {
        const application = await StudentApplication.create({ student: this.id })
        await this.model('Student').findOneAndUpdate({ _id: this.id }, { application: application.id })
    }
    if (!this.family) {
        const family = await StudentFamily.create({ student: this.id })
        await this.model('Student').findOneAndUpdate({ _id: this.id }, { family: family.id })
    }
    if (!this.application) {
        const health = await StudentHealth.create({ student: this.id })
        await this.model('Student').findOneAndUpdate({ _id: this.id }, { health: health.id })
    }

    await Image.findOneAndUpdate({ _id: this.profile }, { isActive: true })
})

module.exports = mongoose.model('Student', schema)