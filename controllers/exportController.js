const response = require('../helpers/response')
const { failureMsg } = require('../constants/responseMsg')
const Attendance = require('../models/Attendance')
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const User = require('../models/User')
const Class = require('../models/Class')
const { Workbook } = require('exceljs')
const { worksheetOption } = require('../configs/excel')
const Academy = require('../models/Academy')
const { calculateAverageScore, calculateGraduateResult, calculateTotalScore, inputDateFormat } = require('../helpers/utils')

exports.attendanceClass = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body

        const id = req.params.id
        const _class = await Class.findById(id).populate('grade students teacher')

        let query = {}
        if (fromDate && toDate) query = { createdAt: { $gte: fromDate < _class.startedAt ? _class.startedAt : fromDate, $lt: toDate } }

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet(`Class ${_class.name['English']}`.toUpperCase(), worksheetOption)
        
        worksheet.spliceRows(1, 1, ...new Array(12))

        worksheet.properties.defaultRowHeight = 15
        worksheet.properties.outlineLevelCol = 2

        // Logo
        const logo = workbook.addImage({ filename: 'uploads/logo.png', extension:'png' })
        const headerText = workbook.addImage({ filename: 'uploads/header.png', extension:'png' })
        worksheet.addImage(logo, {
            tl: { col: 0.35, row: 1.3 },
            ext: { width: 170, height: 90 }
        })
        worksheet.addImage(headerText, {
            tl: { col: 7.1, row: 1.1 },
            ext: { width: 270, height: 90 }
        })

        // Title
        worksheet.mergeCells('A9:I9')
        worksheet.getCell('A9:I9').value = 'Student Attendance Report'.toUpperCase()
        worksheet.getCell('A9:I9').style = { alignment: { vertical: 'middle', horizontal: 'center' }, font: { size: 13, bold: true }}
        
        // Subtitle
        worksheet.mergeCells('A10:I10')
        worksheet.getCell('A10:I10').value = `Academic Year: 2022-2023`
        worksheet.getCell('A10:I10').style = { alignment: { vertical: 'middle', horizontal: 'center' }, font: { size: 13 }}

        worksheet.getCell('B11').value = `Class:`
        worksheet.getCell('B11').style = { alignment: { vertical: 'middle', horizontal: 'right' }}
        worksheet.getCell('C11').value = `${_class.name['English']}`


        worksheet.getCell('E11').value = `Shift:`
        worksheet.getCell('F11').value = `${_class.schedule || 'N/A'}`

        worksheet.getCell('H11').value = `Date:`
        worksheet.getCell('I11').value = new Date()
        
        // Header
        worksheet.columns = [
            { 
                key: 'no', 
                width: 5,  
                style: {
                    alignment: {
                        vertical:'middle',
                        horizontal:'center'
                    }
                }
            },
            { 
                key: 'id', 
                width: 20,
            }, 
            { 
                key: 'lastName', 
                width: 20,
            }, 
            { 
                key: 'firstName', 
                width: 20,
            }, 
            { 
                key: 'gender', 
                width: 20,
            }, 
            { 
                key: 'attendance', 
                width: 20,
            }, 
            { 
                key: 'absent', 
                width: 20,
            }, 
            { 
                key: 'permission', 
                width: 20,
            }, 
            { 
                key: 'others', 
                width: 20,
            }, 
        ]

        const header = worksheet.addRow({ no: 'No', id: 'ID', lastName: 'Last Name', firstName: 'First Name', gender: 'Gender', attendance: 'Attendance', absent: 'Absent', permission: 'Permission', others: 'Others' })
        header.height = 23
        header.eachCell((cell) => {
            cell.style = {
                font: {
                    bold: true,
                    color: { argb: '000000' },
                    size: 11,
                },
                fill:{
                    fgColor: { argb: 'F7EDA4' } ,
                    pattern: 'solid',
                    type: 'pattern' 
                },
                alignment: {
                    vertical:'middle',
                    horizontal:'left'
                }
            }
            if (cell._column._key === 'no') {
                cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }
            }
        })

        // Freeze row
        worksheet.views = [{ state: 'frozen', ySplit: 13 }]

        // Body
        for (const index in _class.students) {
            if (Object.hasOwnProperty.call(_class.students, index)) {
                const student = _class.students[index];
                let totalAttendance = 0
                let totalAbsent = 0
                let totalPermission = 0
                let totalOthers = 0

                const attendances = await Attendance.find({ class: id, user: student.authenticate, ...query })
                attendances.forEach((attendance) => {
                    switch (attendance.permissionType) {
                        case 'Present':
                            totalAttendance += 1
                            break

                        case 'Absent':
                            totalAbsent += 1
                            break

                        case 'Permission':
                            totalPermission += 1
                            break

                        case 'Other':
                            totalOthers += 1
                            break
                    
                        default:
                            break
                    }
                })

                worksheet.addRow({ 
                    no: parseInt(index) + 1, 
                    id: student.ref,
                    lastName: student.lastName,
                    firstName: student.firstName,
                    gender: student.gender,
                    attendance: totalAttendance,
                    absent: totalAbsent,
                    permission: totalPermission,
                    others: totalOthers,
                })
            }
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=class_attendance_from_${fromDate}_to_${toDate}`)

        const file = await workbook.xlsx.writeBuffer()

        return response.success(200, { file }, res)
    } catch (err) {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.attendanceStudent = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        const { id, type } = req.params
        let userObj = null
        switch (type) {
            case 'student':
                const student = await Student.findOne({ authenticate: id })
                userObj = {
                    name: `${student.lastName} ${student.firstName}`,
                    id: student.ref,
                    gender: student.gender,
                    birthDate: student.dateOfBirth,
                    address: student.address,
                    contact: student.contact,
                    type: 'Student'
                }
                break

            case 'teacher':
                const teacher = await Teacher.findOne({ authenticate: id })
                userObj = {
                    name: `${teacher.lastName} ${teacher.firstName}`,
                    id: teacher.ref,
                    gender: teacher.gender,
                    birthDate: teacher.birthDate,
                    address: teacher.address,
                    contact: teacher.contact,
                    email: teacher.email,
                    type: 'Teacher'
                }
                break
        
            default:
                const user = await User.findById(id)
                userObj = {
                    name: user.username,
                    type: 'User'
                }
                break
        }

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet(userObj.name, worksheetOption)
        worksheet.spliceRows(1, 1, ...new Array(8))

        worksheet.properties.defaultRowHeight = 15
        worksheet.properties.outlineLevelCol = 2

        // Logo
        const logo = workbook.addImage({ filename: 'uploads/logo.jpg', extension:'png' })
        worksheet.mergeCells('B1:B3')
        worksheet.addImage(logo, {
            tl: { col: 1.1, row: 0.1 },
            ext: { width: 50, height: 50 }
        })

        // Title
        worksheet.mergeCells('G1:H3')
        worksheet.getCell('G1:H3').value = 'Student Attendance Report'.toUpperCase()
        worksheet.getCell('G1:H3').style = { alignment: { vertical: 'middle', horizontal: 'right' }, font: { size: 13, bold: true } }
        
        // Subtitle
        worksheet.getCell('B5').value = `${userObj.type} ID`
        worksheet.getCell('B5').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C5').value = `${userObj.id || 'N/A'}`
        worksheet.getCell('C5').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('B6').value = 'Gender'
        worksheet.getCell('B6').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C6').value = `${userObj.gender || 'N/A'}`
        worksheet.getCell('C6').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('B7').value = 'Date Of Birth'
        worksheet.getCell('B7').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C7').value = new Date(userObj.birthDate) || 'N/A'
        worksheet.getCell('C7').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G5').value = `Name`
        worksheet.getCell('G5').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H5').value = `${userObj.name || 'N/A'}`
        worksheet.getCell('H5').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G6').value = `Contact`
        worksheet.getCell('G6').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H6').value = `${userObj.contact || 'N/A'}`
        worksheet.getCell('H6').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G7').value = `Date`
        worksheet.getCell('G7').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H7').value = `${inputDateFormat(fromDate)} - ${inputDateFormat(toDate)}`
        worksheet.getCell('H7').style = { alignment: { horizontal: 'right' } }
        
        // Header
        worksheet.columns = [
            { 
                key: 'no', 
                width: 5,  
            },
            { 
                key: 'type', 
                width: 20,
            },
            { 
                key: 'reason', 
                width: 25,
            },
            { 
                key: 'duration', 
                width: 10,
            },
            { 
                key: 'class', 
                width: 25,
            },
            { 
                key: 'grade', 
                width: 25,
            },
            { 
                key: 'checkedIn', 
                width: 25,
                style: {
                    numFmt: 'dd/mm/yyyy h:mm:ss AM/PM'
                }
            },
            { 
                key: 'checkedOut', 
                width: 25,
                style: {
                    numFmt: 'dd/mm/yyyy h:mm:ss'
                }
            }
        ]

        const header = worksheet.addRow({ no: 'No', type: 'Type', reason: 'Reason', duration: 'Duration', class: 'Class', grade: 'Grade', checkedIn: 'Checked In', checkedOut: 'Checked Out' })
        header.height = 23
        header.eachCell((cell) => {
            cell.style = {
                font: {
                    bold: true,
                    color: { argb: '000000' },
                    size: 11,
                },
                fill:{
                    fgColor: { argb: 'DDDDDD' } ,
                    pattern: 'solid',
                    type: 'pattern' 
                },
                alignment: {
                    vertical:'middle',
                    horizontal:'left'
                }
            }
            if (cell._column._key === 'no') {
                cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'right' }
            }
        })

        // Freeze row
        worksheet.views = [{ state: 'frozen', ySplit: 9 }]

        // Body
        const attendances = await Attendance.find({ user: id, createdAt: { $gte: fromDate, $lt: toDate } }).populate({ path: 'class', populate: { path: 'grade' }})
        attendances.forEach((attendance, index) => {
            const duration = Math.ceil(Math.abs(new Date(attendance.checkedOut) - new Date(attendance.checkedIn)) / (1000 * 60 * 60 * 24))
            worksheet.addRow({ 
                no: index + 1, 
                type: attendance.permissionType || 'Present', 
                reason: attendance.description || 'N/A', 
                duration: `${duration} ${duration > 1 ? 'Days' : 'Day'}`,
                class: attendance.class?.name['English'],
                grade: attendance.class?.grade?.name['English'],
                checkedIn: attendance.checkedIn, 
                checkedOut: attendance.checkedOut,
            })
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=class_attendance_from_${fromDate}_to_${toDate}`)

        const file = await workbook.xlsx.writeBuffer()

        return response.success(200, { file }, res)
    } catch (err) {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}

exports.academyClass = async (req, res) => {
    try {
        const { id } = req.params

        const academy = await Academy.findById(id)

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet(academy.name['English'], worksheetOption)
        worksheet.spliceRows(1, 1, ...new Array(8))

        worksheet.properties.defaultRowHeight = 15
        worksheet.properties.outlineLevelCol = 2

        // Logo
        const logo = workbook.addImage({ filename: 'uploads/logo.jpg', extension:'png' })
        worksheet.mergeCells('B1:B3')
        worksheet.addImage(logo, {
            tl: { col: 1.1, row: 0.1 },
            ext: { width: 50, height: 50 }
        })

        // Title
        worksheet.mergeCells('G1:H3')
        worksheet.getCell('G1:H3').value = 'Student Academy Report'.toUpperCase()
        worksheet.getCell('G1:H3').style = { alignment: { vertical: 'middle', horizontal: 'right' }, font: { size: 13, bold: true } }
        
        // Subtitle
        worksheet.getCell('B5').value = `Class`
        worksheet.getCell('B5').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C5').value = `${academy.name['English'] || 'N/A'}`
        worksheet.getCell('C5').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('B6').value = 'Grade'
        worksheet.getCell('B6').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C6').value = `${academy.grade['English'] || 'N/A'}`
        worksheet.getCell('C6').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('B7').value = 'Level'
        worksheet.getCell('B7').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('C7').value = `${academy.level || 'N/A'}`
        worksheet.getCell('C7').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G5').value = `Room`
        worksheet.getCell('G5').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H5').value = `${academy.room || 'N/A'}`
        worksheet.getCell('H5').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G6').value = `Started At`
        worksheet.getCell('G6').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H6').value = new Date(academy.startedAt) || 'N/A'
        worksheet.getCell('H6').style = { alignment: { horizontal: 'right' } }

        worksheet.getCell('G7').value = `Schedule`
        worksheet.getCell('G7').style = { alignment: { horizontal: 'left' } }
        worksheet.getCell('H7').value = `${academy.schedule || 'N/A'}`
        worksheet.getCell('H7').style = { alignment: { horizontal: 'right' } }
        
        // Header
        worksheet.columns = [
            { 
                key: 'no', 
                width: 5,  
            },
            { 
                key: 'rank', 
                width: 7,
            },
            { 
                key: 'id', 
                width: 20,  
            },
            { 
                key: 'name', 
                width: 20,
            },
            { 
                key: 'gender', 
                width: 25,
            },
            { 
                key: 'score', 
                width: 10,
            },
            { 
                key: 'average', 
                width: 25,
            },
            { 
                key: 'grade', 
                width: 25,
            },
        ]

        const header = worksheet.addRow({ rank: 'Rank', id: 'ID', name: 'Name', gender: 'Gender', score: 'Score', average: 'Average', grade: 'Grade' })
        header.height = 23
        header.eachCell((cell) => {
            cell.style = {
                font: {
                    bold: true,
                    color: { argb: '000000' },
                    size: 11,
                },
                fill:{
                    fgColor: { argb: 'DDDDDD' } ,
                    pattern: 'solid',
                    type: 'pattern' 
                },
                alignment: {
                    vertical:'middle',
                    horizontal:'left'
                }
            }
            if (cell._column._key === 'no') {
                cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'right' }
            }
        })

        // Freeze row
        worksheet.views = [{ state: 'frozen', ySplit: 9 }]

        // Body
        academy.students.sort((a, b) => a.score > b.score ? -1 : 1).forEach((student, index) => {
            const scores = academy.scores?.filter(item => item.student.equals(student.id))
            worksheet.addRow({ 
                rank: `#${index + 1}`,
                id: student.ref, 
                name: `${student.lastName} ${student.firstName}`, 
                gender: student.gender,
                score: calculateTotalScore(scores),
                average: calculateAverageScore(scores, academy.subjects.length),
                grade: calculateGraduateResult(scores, academy.subjects), 
            })
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=class_attendance`)

        const file = await workbook.xlsx.writeBuffer()

        return response.success(200, { file }, res)
    } catch (err) {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
