const response = require('../helpers/response')
const Student = require('../models/Student')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel, encryptPassword } = require('../helpers/utils')
const { createStudentValidation, updateStudentApplicationValidation, updateStudentFamilyValidation, updateStudentHealthValidation } = require('../middleware/validations/studentValidation')
const StudentFamily = require('../models/StudentFamily')
const StudentApplication = require('../models/StudentApplication')
const StudentHealth = require('../models/StudentHealth')

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

    Student.find({ isDisabled: false, ...query }, async (err, students) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)

        const totalCount = await Student.count({ isDisabled: false })
        return response.success(200, { data: students, length: totalCount }, res)
    })  
        .skip(page * limit).limit(limit)
        .sort(filterObj)
        .populate({ path: 'profile', select: ['filename'] })
        .populate({ path: 'application', select: ['appliedClass'], populate: { path: 'appliedClass' }})
        .populate({ path: 'currentAcademy', populate: { path: 'class' }})
}

exports.detail = (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: student }, res)
    }).populate('profile').populate('family').populate('health').populate('application')
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = createStudentValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    const currentDate = new Date()
    const startYear = new Date(currentDate.getUTCFullYear(), 0, 1)
    const endYear = new Date(currentDate.getUTCFullYear() + 1, 0, 1)

    const countStudent = await Student.count({ createdAt: { $gte: startYear, $lt: endYear }})
    const ref = `S${body?.gender[0].toUpperCase()}` + currentDate.getFullYear() + countStudent.toString().padStart(5, '0')
    try {
        Student.create({...body, ref, createdBy: req.user.id}, (err, student) => {
            if (err) {
                switch (err.code) {
                    case 11000:
                        return response.failure(422, { msg: 'Student already exists!' }, res, err)
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!student) return response.failure(422, { msg: 'No student created!' }, res, err)
            response.success(200, { msg: 'Student has created successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = createStudentValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Student.findByIdAndUpdate(req.params.id, body, (err, student) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!student) return response.failure(422, { msg: 'No student updated!' }, res, err)
            response.success(200, { msg: 'Student has updated successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    try {
        Student.findByIdAndUpdate(req.params.id, { isDisabled: true }, (err, student) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!student) return response.failure(422, { msg: 'No student deleted!' }, res, err)
            response.success(200, { msg: 'Student has deleted successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._import = async (req, res) => {
    try {
        const students = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: students }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const students = req.body
        const password = await encryptPassword('default')

        students.forEach(student => {
            student.password = password
        })

        Student.insertMany(students)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'students' : 'student'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}

exports.updateFamily = (req, res) => {
    const body = req.body
    const { error } = updateStudentFamilyValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        StudentFamily.findByIdAndUpdate(req.params.id, body, (err, student) => {
            if (err)  return response.failure(422, { msg: err.message }, res, err)

            if (!student) return response.failure(422, { msg: 'No student updated!' }, res, err)
            response.success(200, { msg: 'Student has updated successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.updateApplication = (req, res) => {
    const body = req.body
    const { error } = updateStudentApplicationValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        StudentApplication.findByIdAndUpdate(req.params.id, body, (err, student) => {
            if (err) return response.failure(422, { msg: err.message }, res, err)

            if (!student) return response.failure(422, { msg: 'No student updated!' }, res, err)
            response.success(200, { msg: 'Student has updated successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.updateHealth = (req, res) => {
    const body = req.body
    const { error } = updateStudentHealthValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        StudentHealth.findByIdAndUpdate(req.params.id, body, (err, student) => {
            if (err)  return response.failure(422, { msg: err.message }, res, err)

            if (!student) return response.failure(422, { msg: 'No student updated!' }, res, err)
            response.success(200, { msg: 'Student has updated successfully', data: student }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.selectApplied = (req, res) => {
    StudentApplication.find({ isDisabled: false, appliedClass: req.params.classId }, (err, students) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: students }, res)
    }).populate({ path: 'student', populate: { path: 'profile' } })
}