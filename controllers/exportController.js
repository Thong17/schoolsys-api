const response = require('../helpers/response')
const { failureMsg } = require('../constants/responseMsg')
const Attendance = require('../models/Attendance')
const Class = require('../models/Class')
const { Workbook } = require('exceljs')

exports.attendanceClass = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        const id = req.params.id
        const _class = await Class.findById(id).populate('grade')
        const attendances = await Attendance.find({ class: id, created_on: { $gte: fromDate, $lt: toDate } }).populate('user')

        const worksheetOption = {
            pageSetup: {
                firstPageNumber: 1,
                orientation: 'landscape',
                pageOrder: 'downThenOver',
                paperSize: 9,
                horizontalCentered: true,
                margins: {
                  bottom: 0.5,
                  footer: 0.3,
                  header: 0.3,
                  left: 0.45,
                  right: 0.45,
                  top: 0.5,
                },
            },
        }

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet(`Class ${_class.name['English']}`.toUpperCase(), worksheetOption)

        worksheet.properties.defaultRowHeight = 15
        worksheet.properties.outlineLevelCol = 2

        // Logo
        worksheet.spliceRows(1, 1, ...new Array(7))
        const logo = workbook.addImage({ filename: 'uploads/logo.jpg', extension:'png' })
        worksheet.mergeCells('B1:C3')
        worksheet.addImage(logo, {
            tl: { col: 1.1, row: 0.1 },
            ext: { width: 50, height: 50 }
        })

        // Title
        worksheet.mergeCells('D2:E3')
        worksheet.getCell('D2:E3').value = `Attendance Report`.toUpperCase()
        worksheet.getCell('D2:E3').style = { alignment: { vertical: 'middle', horizontal: 'right' }, font: { size: 13, bold: true } }

        // Subtitle
        worksheet.mergeCells('B5:C5')
        worksheet.getCell('B5:C5').value = `Class: ${_class.name['English']}`

        worksheet.mergeCells('B6:C6')
        worksheet.getCell('B6:C6').value = `Room: ${_class.room || 'N/A'}`

        worksheet.mergeCells('E5')
        worksheet.getCell('E5').value = `Grade: ${_class.grade.name['English']}`
        worksheet.getCell('E5').style = { alignment: { horizontal: 'right' } }

        worksheet.mergeCells('E6')
        worksheet.getCell('E6').value = `Schedule: ${_class.schedule || 'N/A'}`
        worksheet.getCell('E6').style = { alignment: { horizontal: 'right' } }
        
        // Header
        worksheet.views = [{ state: 'frozen', ySplit: 8 }]
        worksheet.columns = [
            { 
                width: 5
            },
            { 
                key: 'no', 
                width: 5,  
            },
            { 
                key: 'id', 
                width: 20,
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

        const header = worksheet.addRow({ no: 'No', id: 'ID', checkedIn: 'Checked In', checkedOut: 'Checked Out' })
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

        // Body
        attendances.forEach((attendance, index) => {
            worksheet.addRow({ no: index + 1, id: attendance.user.username, checkedIn: attendance.checkedIn, checkedOut: attendance.checkedOut })
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=class_attendance_from_${fromDate}_to_${fromDate}`)

        const file = await workbook.xlsx.writeBuffer()

        return response.success(200, { file }, res)
    } catch (err) {
        if (err) return response.failure(422, { msg: failureMsg.trouble }, res, err)
    }
}
