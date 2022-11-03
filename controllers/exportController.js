const response = require('../helpers/response')
const { failureMsg } = require('../constants/responseMsg')
const Attendance = require('../models/Attendance')
const { Workbook } = require('exceljs')

exports.attendanceClass = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        const id = req.params.id
        const attendances = await Attendance.find({ class: id, created_on: { $gte: fromDate, $lt: toDate } })

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet('My Sheet')

        worksheet.columns = [
            {header: 'Id', key: 'id', width: 10},
            {header: 'Name', key: 'name', width: 32}, 
            {header: 'D.O.B.', key: 'dob', width: 15,}
           ];
           
        worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970, 1, 1)});
        worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7)});

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=class_attendance_from_${fromDate}_to_${fromDate}`)

        const file = await workbook.xlsx.writeBuffer()

        return response.success(200, { file }, res)
    } catch (err) {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
