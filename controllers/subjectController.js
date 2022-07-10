const response = require('../helpers/response')
const Subject = require('../models/Subject')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { subjectValidation } = require('../middleware/validations/subjectValidation')

exports.index = (req, res) => {
    Subject.find({ isDisabled: false }, (err, subjects) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: subjects }, res)
    })
}

exports.detail = (req, res) => {
    Subject.findById(req.params.id, (err, subject) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: subject }, res)
    })
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = subjectValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    try {
        Subject.create({...body, createdBy: req.user.id}, (err, subject) => {
            if (err) {
                switch (err.code) {
                    case 11000:
                        return response.failure(422, { msg: 'Subject already exists!' }, res, err)
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!subject) return response.failure(422, { msg: 'No subject created!' }, res, err)
            response.success(200, { msg: 'Subject has created successfully', data: subject }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = subjectValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Subject.findByIdAndUpdate(req.params.id, body, (err, subject) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!subject) return response.failure(422, { msg: 'No subject updated!' }, res, err)
            response.success(200, { msg: 'Subject has updated successfully', data: subject }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    try {
        Subject.findByIdAndUpdate(req.params.id, { isDisabled: true }, (err, subject) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!subject) return response.failure(422, { msg: 'No subject deleted!' }, res, err)
            response.success(200, { msg: 'Subject has deleted successfully', data: subject }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._import = async (req, res) => {
    try {
        const subjects = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: subjects }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const subjects = req.body
        const password = await encryptPassword('default')

        subjects.forEach(subject => {
            subject.password = password
        })

        Subject.insertMany(subjects)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'subjects' : 'subject'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}