const response = require('../helpers/response')
const Attendance = require('../models/Attendance')
const Student = require('../models/Student')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { checkInValidation } = require('../middleware/validations/attendanceValidation')
const StudentAcademy = require('../models/StudentAcademy')
const Class = require('../models/Class')

exports.index = (req, res) => {
    const classId = req.query.classId
    Attendance.find({ isReset: false, class: classId }, (err, attendances) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: attendances }, res)
    })
}

exports.detail = (req, res) => {
    Attendance.findById(req.params.id, (err, attendance) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: attendance }, res)
    })
}

exports.checkIn = (req, res) => {
    const body = req.body
    const { error } = checkInValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    try {
        Attendance.create({...body, createdBy: req.user.id}, async (err, attendance) => {
            if (err) {
                return response.failure(422, { msg: err.message }, res, err)
            }

            if (!attendance) return response.failure(422, { msg: 'No attendance checked in!' }, res, err)

            const _class = await Class.findById(body.class)
            _class.attendance = { ..._class.attendance, checkedIn: _class.attendance?.checkedIn + 1  }
            _class.save()
 
            response.success(200, { msg: 'User has checked in successfully', data: attendance }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.checkOut = (req, res) => {
    try {
        Attendance.findByIdAndUpdate(req.params.id, { checkedOut: Date.now() }, { new: true }, async (err, attendance) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            if (!attendance) return response.failure(422, { msg: 'No attendance checked out!' }, res, err)

            const _class = await Class.findById(attendance.class)
            _class.attendance = { ..._class.attendance, checkedOut: _class.attendance?.checkedOut + 1  }
            _class.save()

            response.success(200, { msg: 'User has checked out successfully', data: attendance }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.reset = (req, res) => {
    try {
        Attendance.findByIdAndUpdate(req.params.id, { isReset: true }, { new: true }, async (err, attendance) => {
            if (err) {
                switch (err.code) {
                    default:
                        return response.failure(422, { msg: err.message }, res, err)
                }
            }

            const _class = await Class.findById(attendance.class)
            _class.attendance = { checkedOut: _class.attendance?.checkedOut - 1, checkedIn: _class.attendance?.checkedIn - 1 }
            _class.save()

            if (!attendance) return response.failure(422, { msg: 'No attendance reset out!' }, res, err)
            response.success(200, { msg: 'User has reset out successfully', data: attendance }, res)
        })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.disable = (req, res) => {
    const attendanceId = req.params.id
    Attendance.findByIdAndUpdate(attendanceId, { isDisabled: true }, async (err, attendance) => {
        if (err) {
            switch (err.code) {
                default:
                    return response.failure(422, { msg: err.message }, res, err)
            }
        }
        if (!attendance) return response.failure(422, { msg: 'No attendance deleted!' }, res, err)

        try {
            await Student.updateOne(
                { _id: attendance.student },
                { $pull: { attendances: attendanceId } }
            )
            response.success(200, { msg: 'Attendance has deleted successfully', data: attendance }, res)
        } catch (err) {
            return response.failure(422, { msg: failureMsg.trouble }, res, err)
        }
    })
}

exports._delete = (req, res) => {
    const attendanceId = req.params.id
    Attendance.findByIdAndDelete(attendanceId, async (err, attendance) => {
        if (err) {
            switch (err.code) {
                default:
                    return response.failure(422, { msg: err.message }, res, err)
            }
        }
        if (!attendance) return response.failure(422, { msg: 'No attendance deleted!' }, res, err)

        try {
            await StudentAcademy.updateOne(
                { _id: attendance.academy },
                { $pull: { attendances: attendanceId } }
            )
            response.success(200, { msg: 'Attendance has deleted successfully', data: attendance }, res)
        } catch (err) {
            return response.failure(422, { msg: failureMsg.trouble }, res, err)
        }
    })
}

exports._import = async (req, res) => {
    try {
        const attendances = await readExcel(req.file.buffer, req.body.fields)
        response.success(200, { msg: 'List has been previewed', data: attendances }, res)
    } catch (err) {
        return response.failure(err.code, { msg: err.msg }, res)
    }
}

exports.batch = async (req, res) => {
    try {
        const attendances = req.body
        const password = await encryptPassword('default')

        attendances.forEach(attendance => {
            attendance.password = password
        })

        Attendance.insertMany(attendances)
            .then(data => {
                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'attendances' : 'attendance'} has been inserted` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}

exports.checkInAll = async (req, res) => {
    try {
        const attendances = req.body
        const classId = req.params.classId
        Attendance.insertMany(attendances)
            .then(async data => {
                const _class = await Class.findById(classId)
                _class.attendance = { ..._class.attendance, checkedIn: _class.attendance?.checkedIn + data.length  }
                _class.save()

                response.success(200, { msg: `${data.length} ${data.length > 1 ? 'students' : 'student'} has been checked in`, data }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}

exports.checkOutAll = async (req, res) => {
    try {
        const classId = req.params.classId
        Attendance.updateMany({ class: classId, isReset: false, checkedOut: null }, { checkedOut: Date.now() })
            .then(async data => {
                const _class = await Class.findById(classId)
                _class.attendance = { ..._class.attendance, checkedOut: _class.attendance?.checkedOut + data.modifiedCount  }
                _class.save()

                response.success(200, { msg: `${data.modifiedCount} ${data.modifiedCount > 1 ? 'students' : 'student'} has been checked out` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}

exports.resetAll = async (req, res) => {
    try {
        const classId = req.params.classId
        Attendance.updateMany({ class: classId, isReset: false }, { isReset: true })
            .then(async data => {
                const _class = await Class.findById(classId)
                _class.attendance = {
                    checkedIn: 0,
                    checkedOut: 0
                }
                _class.save()
                response.success(200, { msg: `${data.modifiedCount} ${data.modifiedCount > 1 ? 'students' : 'student'} has been reset` }, res)
            })
            .catch(err => {
                return response.failure(422, { msg: err.message }, res)
            })
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res)
    }
}