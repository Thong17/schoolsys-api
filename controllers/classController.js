const response = require('../helpers/response')
const Class = require('../models/Class')
const Student = require('../models/Student')
const Subject = require('../models/Subject')
const StudentAcademy = require('../models/StudentAcademy')
const StudentApplication = require('../models/StudentApplication')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { classValidation } = require('../middleware/validations/classValidation')

exports.index = (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 0
    const search = req.query.search?.replace(/ /g,'')
    const field = req.query.field || 'tags'
    const filter = req.query.filter || 'createdAt'
    const sort = req.query.sort || 'asc'

    let filterObj = { [filter]: sort }
    let query = {}
    if (search) {
        query[field] = {
            $regex: new RegExp(search, 'i')
        }
    }

    Class.find({ isDisabled: false, ...query }, async (err, classes) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)

        const totalCount = await Class.count({ isDisabled: false })
        return response.success(200, { data: classes, length: totalCount }, res)
    })
        .skip(page * limit).limit(limit)
        .sort(filterObj)
        .populate({ path: 'students', match: { isDisabled: false } }).populate('grade')
}

exports.list = async (req, res) => {
    Class.find({ isDisabled: false }, (err, classes) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: classes }, res)
    }).select('name')
}

exports.detail = (req, res) => {
    Class.findById(req.params.id, (err, _class) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: _class }, res)
    }).populate({ path: 'students', match: { isDisabled: false }, populate: [{ path: 'profile'}, { path: 'currentAcademy', populate: { path: 'scores' } }] }).populate({ path: 'grade', populate: { path: 'subjects' } }).populate({path: 'teacher', populate: { path: 'profile', select: { filename: 1 } }})
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = classValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    if (body.monitor === '') body.monitor = null
    if (body.teacher === '') body.teacher = null
    
    try {
        Class.create({...body, createdBy: req.user.id}, (err, _class) => {
            if (err) {
                switch (err.code) {
                    case 11000:
                        return response.failure(422, { msg: 'Class already exists!' }, res, err)
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!_class) return response.failure(422, { msg: 'No class created!' }, res, err)
            response.success(200, { msg: 'Class has created successfully', data: _class }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = classValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Class.findByIdAndUpdate(req.params.id, body, (err, _class) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!_class) return response.failure(422, { msg: 'No class updated!' }, res, err)
            response.success(200, { msg: 'Class has updated successfully', data: _class }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._delete = (req, res) => {
    try {
        Class.findByIdAndUpdate(req.params.id, { isDisabled: true }, (err, _class) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!_class) return response.failure(422, { msg: 'No class deleted!' }, res, err)
            response.success(200, { msg: 'Class has deleted successfully', data: _class }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._import = async (req, res) => {
    try {
        const _classes = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: _classes }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const _classes = req.body
        const password = await encryptPassword('default')

        _classes.forEach(_class => {
            _class.password = password
        })

        Class.insertMany(_classes)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'classes' : 'class'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}

exports.acceptApplied = async (req, res) => {
    try {
        const applied = await StudentApplication.findById(req.params.id)
        const student = await Student.findById(applied.student)
        const appliedClass = await Class.findOne({ _id: applied.appliedClass })

        if (appliedClass.students?.indexOf(student?._id) > -1) return response.failure(406, { msg: 'Student has already exist in the class' }, res)
        if (student.currentAcademy) return response.failure(406, { msg: 'Student has already in the class' }, res)

        const academy = await StudentAcademy.create({ student: student?._id, class: appliedClass._id })

        student.currentAcademy = academy._id
        student.academies.push(academy._id)
        student.save()

        applied.appliedClass = null
        applied.save()

        appliedClass.students.push(student?._id)
        appliedClass.save()

        response.success(200, { msg: 'Student has been accepted', data: student }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.rejectApplied = async (req, res) => {
    try {
        const applied = await StudentApplication.findById(req.params.id)
        applied.appliedClass = null
        applied.save()
        response.success(200, { msg: 'Student has been rejected' }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.removeStudent = async (req, res) => {
    const classId = req.body.classId
    Class.updateOne(
        { _id: classId },
        { $pull: { students: req.params.id } }
    ).then(async () => {
        try {
            const student = await Student.findById(req.params.id)
            const academy = await StudentAcademy.findById(student.currentAcademy)

            student.currentAcademy = null
            student.save()

            academy.endedAt = Date.now()
            academy.save()

            response.success(200, { msg: 'Student has been removed' }, res)
        } catch (err) {
            return response.failure(422, { msg: failureMsg.trouble }, res, err)
        }
    }).catch(err => {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    })
}

exports.listStudent = (req, res) => {
    Class.findById(req.params.id, async (err, _class) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: _class?.students }, res)
    }).populate({ path: 'students', populate: [{ path: 'currentAcademy', populate: { path: 'scores' } }, { path: 'profile' }] })
}

exports.listSubject = (req, res) => {
    Subject.find({ isDisabled: false, grade: req.params.id }, async (err, subjects) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: subjects }, res)
    })
}

exports.graduate = (req, res) => {
    Class.graduate(req.params.id, req.user.id, (err, data) => {
        if (err) return response.failure(err.code, { msg: err.msg }, res, err)
        return response.success(200, { data }, res)
    })
}

exports.enable = (req, res) => {
    try {
        Class.findByIdAndUpdate(req.params.id, { isActive: true, startedAt: Date.now() }, (err, _class) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!_class) return response.failure(422, { msg: 'No class started!' }, res, err)
            response.success(200, { msg: 'Class has been started successfully', data: _class }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
