const response = require('../helpers/response')
const Score = require('../models/Score')
const Student = require('../models/Student')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { scoreValidation } = require('../middleware/validations/scoreValidation')

exports.index = (req, res) => {
    Score.find({ isDisabled: false }, (err, scores) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: scores }, res)
    }).populate({ path: 'subjects', match: { isDisabled: false } })
}

exports.detail = (req, res) => {
    Score.findById(req.params.id, (err, score) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: score }, res)
    }).populate({ path: 'subjects', match: { isDisabled: false }, populate: { path: 'teacher' }})
}

exports.create = async (req, res) => {
    const body = req.body
    const { error } = scoreValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    try {
        Score.create({...body, createdBy: req.user.id}, (err, score) => {
            if (err) {
                return response.failure(422, { msg: err.message }, res, err)
            }

            if (!score) return response.failure(422, { msg: 'No score added!' }, res, err)
            response.success(200, { msg: 'Score has added successfully', data: score }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.update = (req, res) => {
    const body = req.body
    const { error } = scoreValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)

    try {
        Score.findByIdAndUpdate(req.params.id, body, (err, score) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!score) return response.failure(422, { msg: 'No score updated!' }, res, err)
            response.success(200, { msg: 'Score has updated successfully', data: score }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    const scoreId = req.params.id
    Score.findByIdAndUpdate(scoreId, { isDisabled: true }, async (err, score) => {
        if (err) {
            switch (err.code) {
                default:
                    return response.failure(422, { msg: err.message }, res, err)
            }
        }
        if (!score) return response.failure(422, { msg: 'No score deleted!' }, res, err)

        try {
            await Student.updateOne(
                { _id: score.student },
                { $pull: { scores: scoreId } }
            )
            response.success(200, { msg: 'Score has deleted successfully', data: score }, res)
        } catch (err) {
            return response.failure(422, { msg: failureMsg.trouble }, res, err)
        }
    })
}

exports._import = async (req, res) => {
    try {
        const scores = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: scores }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const scores = req.body
        const password = await encryptPassword('default')

        scores.forEach(score => {
            score.password = password
        })

        Score.insertMany(scores)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'scores' : 'score'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}