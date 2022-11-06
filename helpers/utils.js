const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const responseMsg = require('../constants/responseMsg')

module.exports = utils = {
    encryptPassword: (plainPassword) => {
        return bcrypt.hash(plainPassword, 10)
    },
    comparePassword: (plainPassword, encryptedPassword) => {
        return bcrypt.compare(plainPassword, encryptedPassword)
    },
    extractJoiErrors: (error) => {
        const messages = []
        error.details?.forEach(error => {
            const obj = {
                path: error.message,
                key: error.context.label
            }
            messages.push(obj)
        });
        return messages
    },
    issueToken: (data, secret, expire) => {
        return new Promise((resolve, reject) => {
            try {
                const token = jwt.sign(data, secret, { expiresIn: expire })
                resolve(token)
            } catch (err) {
                reject(err)
            }
        })
    },
    verifyToken: (token, secret) => {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jwt.verify(token, secret)
                resolve(decoded)
            } catch (err) {
                if (err.name !== 'TokenExpiredError') reject(err)
                const decoded = jwt.decode(token, secret)
                reject(decoded)
            }
        })
    },
    createHash: (str) => {
        const sha256 = require('js-sha256')
        return sha256.hex(str).toString()
    },
    calculateTotalScore: (scores, subject = null) => {
        let total = 0
        if (subject) {
            scores?.forEach((score) => {
            if (score.subject === subject) total += score.score
            })
            return total
        } else {
            scores?.forEach((score) => {
            total += score.score
            })
            return total
        }
    },
    calculateAverageScore: (scores, number) => {
        let total = 0
        scores?.forEach((score) => {
            total += score.score
        })

        if (total === 0) return '0.00'
        return (total / number).toFixed(2)
    },
    calculateGraduateResult: (scores, subjects) => {
        let totalScore = 0
        let passScore = 0
        let fullScore = 0

        scores?.forEach((score) => {
            totalScore += score.score
        })

        subjects?.forEach((subject) => {
            passScore += subject.passScore
            fullScore += subject.fullScore
        })

        const totalAverage = totalScore / subjects?.length
        const passAverage = passScore / subjects?.length
        const fullAverage = fullScore / subjects?.length

        const gradeF = passAverage
        const gradeE = passAverage + (fullAverage - passAverage) / 4
        const gradeD = gradeE + (fullAverage - passAverage) / 4
        const gradeC = gradeD + (fullAverage - passAverage) / 4
        const gradeB = gradeD + (fullAverage - passAverage) / 3
        const gradeA = fullAverage

        switch (true) {
            case totalAverage < gradeF:
            return 'F'
            case totalAverage < gradeE:
            return 'E'
            case totalAverage < gradeD:
            return 'D'
            case totalAverage < gradeC:
            return 'C'
            case totalAverage < gradeB:
            return 'B'
            case totalAverage <= gradeA:
            return 'A'
        }
    },
    inputDateFormat: (d) => {
        if (d === '') return d
      
        let date = new Date(d)
        let dd = date.getDate()
        let mm = date.getMonth() + 1
        let yyyy = date.getFullYear()
        if (dd < 10) {
          dd = '0' + dd
        }
        if (mm < 10) {
          mm = '0' + mm
        }
        return (d = yyyy + '/' + mm + '/' + dd)
    },
    readExcel: (buffer, field) => {
        const xlsx = require('xlsx')
        const ObjectId = mongoose.Types.ObjectId
        return new Promise((resolve, reject) => {
            try {
                const fields = field.split(',')
                const workbook = xlsx.read(buffer, { type: 'buffer' })
                const json = xlsx.utils.sheet_to_json(workbook.Sheets?.['Sheet1'] || {})
                const data = []
                let no = 0
                json.forEach(row => {
                    let obj = {}
                    no++
                    fields.forEach(column => {
                        let value = row?.[column]
                        if (!value) return
                        if (column === '_id') value = new ObjectId(value)

                        obj = {
                            ...obj,
                            no: no,
                            [column]: value
                        }
                    })
                    Object.keys(obj).length > 0 && data.push(obj) 
                })
                if (data.length === 0) reject({ msg: 'Invalid excel format!', code: 422 })
                resolve(data)
            } catch (err) {
                reject({ msg: responseMsg.failureMsg.trouble, code: 422 })
            }
        })
    }
}