const response = require('../helpers/response')
const Student = require('../models/Student')
const Attendance = require('../models/Attendance')
const { failureMsg } = require('../constants/responseMsg')
const Class = require('../models/Class')
const Role = require('../models/Role')
const User = require('../models/User')

exports.operation = async (req, res) => {
    try {
        const students = await Student.count({ isDisabled: false })
        const attendances = await Attendance.count({ isReset: false })
        const annualLeave = await Attendance.count({ isReset: false, permissionType: 'Annual Leave' })
        const sickLeave = await Attendance.count({ isReset: false, permissionType: 'Sick Leave' })
        const absent = await Attendance.count({ isReset: false, permissionType: 'Absent' })

        const classes = await Class.find({ isDisabled: false }).select('students attendance name -_id')
        const checkedIn = []
        const checkedOut = []

        classes.forEach(cl => {
            const totalStudent = cl.students?.length || 0
            let obj = {
                name: cl.name,
                value: totalStudent,
                title: 'Student',
            }
            checkedIn.push({
                ...obj,
                percentage: cl.attendance?.checkedIn / totalStudent
            })
            checkedOut.push({
                ...obj,
                percentage: cl.attendance?.checkedOut / totalStudent
            })
        })

        return response.success(200, { data: { students, attendances, annualLeave, sickLeave, absent, checkedIn, checkedOut } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.school = async (req, res) => {
    try {

    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.admin = async (req, res) => {
    try {
        const totalRole = await Role.count({ isDisabled: false })
        const totalUser = await User.count({ isDisabled: false })

        return response.success(200, { data: { totalRole, totalUser } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
