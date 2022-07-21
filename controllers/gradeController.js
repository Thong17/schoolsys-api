const response = require('../helpers/response')
const Grade = require('../models/Grade')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { gradeValidation } = require('../middleware/validations/gradeValidation')

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

    Grade.find({ isDisabled: false, ...query }, async (err, grades) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)

        const totalCount = await Grade.count({ isDisabled: false })
        return response.success(200, { data: grades, length: totalCount }, res)
    })  
        .skip(page * limit).limit(limit)
        .sort(filterObj)
        .populate({ path: 'subjects', match: { isDisabled: false } })
}

exports.list = async (req, res) => {
    Grade.find({ isDisabled: false }, (err, grades) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: grades }, res)
    }).select('name')
}

exports.detail = (req, res) => {
    Grade.findById(req.params.id, (err, grade) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: grade }, res)
    }).populate({ path: 'subjects', match: { isDisabled: false }, populate: { path: 'teacher' }})
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = gradeValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    try {
        Grade.create({...body, createdBy: req.user.id}, (err, grade) => {
            if (err) {
                switch (err.code) {
                    case 11000:
                        return response.failure(422, { msg: 'Grade already exists!' }, res, err)
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!grade) return response.failure(422, { msg: 'No grade created!' }, res, err)
            response.success(200, { msg: 'Grade has created successfully', data: grade }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = gradeValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Grade.findByIdAndUpdate(req.params.id, body, (err, grade) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!grade) return response.failure(422, { msg: 'No grade updated!' }, res, err)
            response.success(200, { msg: 'Grade has updated successfully', data: grade }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    try {
        Grade.findByIdAndUpdate(req.params.id, { isDisabled: true }, (err, grade) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!grade) return response.failure(422, { msg: 'No grade deleted!' }, res, err)
            response.success(200, { msg: 'Grade has deleted successfully', data: grade }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports._import = async (req, res) => {
    try {
        const grades = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: grades }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const grades = req.body
        const password = await encryptPassword('default')

        grades.forEach(grade => {
            grade.password = password
        })

        Grade.insertMany(grades)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'grades' : 'grade'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}