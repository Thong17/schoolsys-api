const response = require('../helpers/response')
const Attendance = require('../models/Attendance')
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const { failureMsg } = require('../constants/responseMsg')
const { extractJoiErrors, readExcel } = require('../helpers/utils')
const { checkInValidation, permissionValidation } = require('../middleware/validations/attendanceValidation')
const StudentAcademy = require('../models/StudentAcademy')
const Class = require('../models/Class')

exports.index = (req, res) => {
    const classId = req.query.classId
    Attendance.find({ isReset: false, class: classId }, (err, attendances) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        return response.success(200, { data: attendances }, res)
    })
}

exports.report = (req, res) => {
    const classId = req.params.classId
    Attendance.find({ class: classId }, async (err, attendances) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)

        const data = []
        for (const index in attendances) {
            if (Object.hasOwnProperty.call(attendances, index)) {
                const attendance = attendances[index]
                switch (attendance.user.segment) {
                    case 'Student':
                        const student = await Student.findOne({ authenticate: attendance.user._id }).populate('profile')
                        data.push({ ...attendance._doc, username: `${student.lastName} ${student.firstName}`, profile: student.profile.filename, gender: student.gender })
                        break

                    case 'Teacher':
                        const teacher = await Teacher.findOne({ authenticate: attendance.user._id }).populate('profile')
                        data.push({ ...attendance._doc, username: `${teacher.lastName} ${teacher.firstName}`, profile: teacher.profile.filename, gender: teacher.gender })
                        break

                    default:
                        data.push({ ...attendance._doc })
                        break
                }
            }
        }

        return response.success(200, { data }, res)
    }).populate('user')
}

exports.detail = (req, res) => {
    const userId = req.params.userId
    const { classId, type } = req.query
    const query = { user: userId }
    if (classId) query['class'] = classId

    Attendance.find(query, async (err, attendances) => {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
        let total = {
            totalAL: 0,
            totalSL: 0,
            totalAb: 0,
            totalPresent: 0
        }
        attendances.forEach((attendance) => {
            switch (attendance.permissionType) {
                case 'Annual Leave':
                    total.totalAL = total.totalAL + 1
                    break
                case 'Sick Leave':
                    total.totalSL = total.totalSL + 1
                    break
                case 'Absent':
                    total.totalAb = total.totalAb + 1
                    break
                default:
                    total.totalPresent = total.totalPresent + 1
                    break
            }
        })

        switch (type) {
            case 'teacher':
                const teacher = await Teacher.findOne({ authenticate: userId, isDisabled: false }).select('ref lastName firstName gender contact').populate('profile', 'filename -_id')
                return response.success(200, { data: { attendances, user: teacher, ...total } }, res)
        
            default:
                const student = await Student.findOne({ authenticate: userId, isDisabled: false }).select('ref lastName firstName gender contact').populate('profile', 'filename -_id')
                return response.success(200, { data: { attendances, user: student, ...total } }, res)
        }
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

exports.permission = async (req, res) => {
    const body = req.body
    const { error } = permissionValidation.validate(body, { abortEarly: false })
    if (error) return response.failure(422, extractJoiErrors(error), res)
    
    try {
        const attendanceId = body.attendance
        if (attendanceId) {
            await Attendance.findByIdAndUpdate(attendanceId, { checkedOut: Date.now() })
            delete body.attendance
        }
        Attendance.create({...body, createdBy: req.user.id}, async (err, attendance) => {
            if (err) return response.failure(422, { msg: err.message }, res, err)
            if (!attendance) return response.failure(422, { msg: 'No permission added!' }, res, err)

            const _class = await Class.findById(body.class)
            _class.attendance = { checkedIn: _class.attendance?.checkedIn + 1, checkedOut: _class.attendance?.checkedOut + 1  }
            _class.save()
 
            response.success(200, { msg: 'Permission has added successfully', data: attendance }, res)
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