const mongoose = require('mongoose')
const Icon = require('./Icon')

const schema = mongoose.Schema(
    {
        name: {
            type: Object,
            require: true
        },
        status: {
            type: Boolean,
            default: false
        },
        icon: {
            type: mongoose.Schema.ObjectId,
            ref: 'Icon'
        },
        description: {
            type: String,
            default: ''
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        products: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }],
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

schema.pre('save', async function (next) {
    try {
        if (this.icon) {
            await Icon.findOneAndUpdate({ _id: this.icon }, { isActive: false })
        }
        next()
    } catch (err) {
        next(err)
    }
})

schema.post('save', async function () {
    await Icon.findOneAndUpdate({ _id: this.icon }, { isActive: true })
})

schema.pre('insertMany', async function (next, doc) {
    const promises = []
    for (let index = 0; index < doc.length; index++) {
        const brand = doc[index]
        const icon = await Icon.findOne({ _id: brand?.icon?._id })
        if (brand.icon && !icon) {
            const promise = await Icon.create(brand.icon)
            promises.push(promise)
        }
    }
    Promise.all(promises)
        .then(() => next())
        .catch((err) => next(err))
})

module.exports = mongoose.model('Brand', schema)