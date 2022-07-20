const mongoose = require('mongoose')

const schema = mongoose.Schema(
    {
        name: {
            type: Object,
            index: {
                unique: true,
            },
            required: [true, 'Name is required!']
        },
        level: {
            type: String,
        },
        subjects: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Subject'
        }],
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        description: {
            type: String,
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
        this.tags = `${JSON.stringify(this.name)}${this.level}${this.description}`.replace(/ /g,'')
        next()
    } catch (err) {
        next(err)
    }
})

module.exports = mongoose.model('Grade', schema)