const response = require('../helpers/response')
const Config = require('../models/Config')
const Student = require('../models/Student')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel, encryptPassword } = require('../helpers/utils')
const { createStudentValidation } = require('../middleware/validations/studentValidation')

exports.index = (req, res) => {
    Student.find({ isDisabled: false }, (err, students) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: students }, res)
    })
}

exports.detail = (req, res) => {
    Student.findById(req.params.id, (err, student) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: student }, res)
    }).populate('profile')
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = createStudentValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    const countStudent = await Student.count()
    const currentDate = new Date()
    const ref = currentDate.getFullYear() + countStudent

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