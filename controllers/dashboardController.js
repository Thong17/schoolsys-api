const response = require('../helpers/response')
const Attendance = require('../models/Attendance')
const { failureMsg } = require('../constants/responseMsg')
const Class = require('../models/Class')
const Grade = require('../models/Grade')
const Teacher = require('../models/Teacher')
const Student = require('../models/Student')
const Role = require('../models/Role')
const User = require('../models/User')
const StudentApplication = require('../models/StudentApplication')
const StudentAcademy = require('../models/StudentAcademy')

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
                checkedIn: cl.attendance?.checkedIn
            })
            checkedOut.push({
                ...obj,
                checkedOut: cl.attendance?.checkedOut
            })
        })

        return response.success(200, { data: { students, attendances, annualLeave, sickLeave, absent, checkedIn, checkedOut } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.school = async (req, res) => {
    try {
        const totalClass = await Class.count({ isDisabled: false })
        const totalGrade = await Grade.count({ isDisabled: false })
        const totalStudent = await Student.count({ isDisabled: false })
        const totalTeacher = await Teacher.count({ isDisabled: false })
        const progressClass = await Class.count({ isDisabled: false, isActive: true })
        const closedClass = await Class.count({ isDisabled: false, isActive: false })
        const listGrade = await Grade.find({ isDisabled: false }).select('name subjects level')
        const pendingApplication = await StudentApplication.count({ appliedClass: { $ne: null } })

        const grades = []
        listGrade.forEach((grade) => {
            let obj = {
                name: grade.name,
                value: grade.subjects?.length || 0,
                title: 'Subject',
                detail: grade.level
            }
            grades.push(obj)
        })

        const classes = [
            {
                name: 'In Progress',
                value: progressClass,
                title: 'Qty',
            },
            {
                name: 'Closed',
                value: closedClass,
                title: 'Qty',
            }
        ]

        return response.success(200, { data: { totalClass, totalGrade, totalStudent, totalTeacher, classes, grades, pendingApplication } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.admin = async (req, res) => {
    try {
        const totalRole = await Role.count({ isDisabled: false })
        const totalUser = await User.count({ isDisabled: false })
        const roles = await Role.find({ isDisabled: false }).select('name privilege')
        let totalPrivilege
        const roleData = []
        roles.forEach((role) => {
            let privilege = 0
            totalPrivilege = 0
            Object.keys(role.privilege)?.forEach((route) => {
                Object.keys(role.privilege?.[route])?.forEach((action) => {
                    if (role.privilege?.[route]?.[action]) privilege += 1
                    totalPrivilege += 1
                })
            })
            let obj = {
                id: role._id,
                name: role.name,
                value: privilege,
                title: 'Assigned',
                detail: totalPrivilege
            }
            roleData.push(obj)
        })

        const users = await User.find({ isDisabled: false }).select('role')
        const userData = []
        roleData.forEach((role) => {
            let userObj = {
                name: role.name,
                value: 0,
                title: 'User',
                detail: role.value
            }
            users.forEach((user) => {
                if (user.role.equals(role.id)) userObj.value += 1
            })
            userData.push(userObj)
        })

        return response.success(200, { data: { totalRole, totalUser, totalPrivilege, roles: roleData, users: userData } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.report = async (req, res) => {
    try {
        const { _topStudent, _topClass, _chartData } = req.query
        let classQuery = {
            isDisabled: false
        }
        if (_topClass) classQuery['grade'] = _topClass

        
        const academies = await StudentAcademy.find({ isDisabled: false }).select('student scores class').populate('class').populate('scores').populate({ path: 'student', select: { 'lastName': 1, 'firstName': 1, 'profile': 1 }, populate: { path: 'profile', select: { 'filename': 1 } } })
        const classes = await Class.find(classQuery).select('name')
        const studentScores = []
        const allScores = []
        const classScores = []

        academies.forEach((academy) => {
            let totalScore = 0
            academy?.scores?.forEach((score) => {
                totalScore += score.score
            })
            const studentObj = {
                class: academy.class,
                name: `${academy.student?.lastName} ${academy.student?.firstName}`,
                profile: academy.student?.profile?.filename,
                totalScore
            }
            allScores.push(studentObj)
            if (_topStudent && !academy.class?.grade.equals(_topStudent)) return
            studentScores.push(studentObj)
        })
        
        classes.forEach((_class) => {
            let totalScore = 0
            allScores.forEach((student) => {
                if (student.class?.equals(_class._id)) totalScore += student.totalScore
            })
            classScores.push({
                name: _class.name,
                totalScore
            })
        })

        let topClass = classScores.length && classScores.reduce((a, b) => a.totalScore > b.totalScore ? a : b)
        let topStudent = studentScores.length && studentScores.reduce((a, b) => a.totalScore > b.totalScore ? a : b)
        return response.success(200, { data: { topStudent, topClass } }, res)
    } catch (err) {
        return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
