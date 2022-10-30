const mongoose = require('mongoose')
const StudentApplication = require('./StudentApplication')
const Academy = require('./Academy')
const Student = require('./Student')

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
        monitor: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student'
        },
        isActive: {
            type: Boolean,
            default: false
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        startedAt: { 
            type: Date,
            default: Date.now
        },
        attendance: {
            type: Object,
            default: {
                checkedIn: 0,
                checkedOut: 0
            }
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
        this.tags = `${JSON.stringify(this.name)}${this.room || ''}${this.schedule}${this.description || ''}${this.startedAt}`.replace(/ /g,'')
        next()
    } catch (err) {
        next(err)
    }
})

schema.post('find', async function (data) {
    for (const _class in data) {
        const totalApplied = await StudentApplication.count({ appliedClass: data[_class]?._id }).exec()
        data[_class]['totalApplied'] = totalApplied
    }
})

schema.statics.graduate = function (id, createdBy, cb) {
    this.findById(id)
        .populate({ path: 'students', populate: [{ path: 'currentAcademy', populate: 'scores' }, { path: 'profile' }] })
        .populate({ path: 'grade', populate: { path: 'subjects', populate: 'teacher' } })
        .populate('teacher monitor')
        .then(async _class => {
            if (!_class) return cb({ code: 404, msg: 'Class is not exist' }, null)
            let scores = []

            for (const key in _class.students) {
                if (Object.hasOwnProperty.call(_class.students, key)) {
                    const student = _class.students[key]
                    scores = student?.currentAcademy?.scores && [...scores, ...student?.currentAcademy?.scores]
                    await Student.findByIdAndUpdate(student?._id, { currentAcademy: null })
                }
            }

            await Academy.create({
                name: _class.name,
                room: _class.room,
                schedule: _class.schedule,
                students: _class.students.map(item => ({ id: item._id, ref: item.ref, lastName: item.lastName, firstName: item.firstName, gender: item.gender, dateOfBirth: item.dateOfBirth, profile: item.profile?.toObject({ getters: true }) })),
                subjects: _class.grade?.subjects.map(item => ({ id: item._id, name: item.name, passScore: item.passScore, fullScore: item.fullScore, teacher: item.teacher?.toObject({ getters: true }) })),
                scores: scores.map(item => ({ id: item._id, score: item.score, student: item.student, subject: item.subject })),
                grade: _class.grade?.name,
                createdBy,
                teacher: _class.teacher?.toObject({ getters: true }),
                monitor: _class.monitor?.toObject({ getters: true }),
                startedAt: _class.startedAt,
                endedAt: Date.now()
            })

            _class.students = []
            _class.isActive = false
            _class.save()

            cb(null, { code: 200, msg: 'Class has been graduated' })
        })
        .catch(err => {
            cb({ code: 422, msg: err.message }, null)
        })
}


module.exports = mongoose.model('Class', schema)