const response = require('../helpers/response')
const Class = require('../models/Class')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { classValidation } = require('../middleware/validations/classValidation')

exports.index = (req, res) => {
    Class.find({ isDisabled: false }, (err, _classes) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: _classes }, res)
    }).populate({ path: 'students', match: { isDisabled: false } }).populate('grade')
}

exports.detail = (req, res) => {
    Class.findById(req.params.id, (err, _class) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: _class }, res)
    }).populate({ path: 'students', match: { isDisabled: false } })
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = classValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
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

exports.disable = (req, res) => {
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