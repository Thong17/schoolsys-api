const response = require('../helpers/response')
const Config = require('../models/Config')
const Teacher = require('../models/Teacher')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel, encryptPassword } = require('../helpers/utils')
const { createTeacherValidation } = require('../middleware/validations/teacherValidation')

exports.index = (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 0
    const search = req.query.search
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

    Teacher.find({ isDisabled: false, ...query }, async (err, teachers) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)

        const totalCount = await Teacher.count({ isDisabled: false })
        return response.success(200, { data: teachers, length: totalCount }, res)
    })
        .skip(page * limit).limit(limit)
        .sort(filterObj)
        .populate('profile')
}

exports.detail = (req, res) => {
    Teacher.findById(req.params.id, (err, teacher) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: teacher }, res)
    }).populate('profile')
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = createTeacherValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    const currentDate = new Date()
    const startYear = new Date(currentDate.getUTCFullYear(), 0, 1)
    const endYear = new Date(currentDate.getUTCFullYear() + 1, 0, 1)

    const countTeacher = await Teacher.count({ createdAt: { $gte: startYear, $lt: endYear }})
    const ref = `T${body?.gender[0].toUpperCase()}` + currentDate.getFullYear() + countTeacher.toString().padStart(5, '0')
    try {
        Teacher.create({...body, ref, createdBy: req.user.id}, (err, teacher) => {
            if (err) {
                switch (err.code) {
                    case 11000:
                        return response.failure(422, { msg: 'Teacher already exists!' }, res, err)
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!teacher) return response.failure(422, { msg: 'No teacher created!' }, res, err)
            response.success(200, { msg: 'Teacher has created successfully', data: teacher }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = createTeacherValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Teacher.findByIdAndUpdate(req.params.id, body, (err, teacher) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!teacher) return response.failure(422, { msg: 'No teacher updated!' }, res, err)
            response.success(200, { msg: 'Teacher has updated successfully', data: teacher }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    try {
        Teacher.findByIdAndUpdate(req.params.id, { isDisabled: true }, (err, teacher) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!teacher) return response.failure(422, { msg: 'No teacher deleted!' }, res, err)
            response.success(200, { msg: 'Teacher has deleted successfully', data: teacher }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._import = async (req, res) => {
    try {
        const teachers = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: teachers }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const teachers = req.body
        const password = await encryptPassword('default')

        teachers.forEach(teacher => {
            teacher.password = password
        })

        Teacher.insertMany(teachers)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'teachers' : 'teacher'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}