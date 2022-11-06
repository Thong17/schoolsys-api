const router = require('express').Router()
const { attendanceClass, attendanceStudent, academyClass } = require('../../controllers/exportController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.post('/attendance/class/:id', security.role(privilege.student.list), (req, res) => {
    attendanceClass(req, res)
})

router.post('/attendance/student/:id/:type', security.role(privilege.student.list), (req, res) => {
    attendanceStudent(req, res)
})

router.post('/academy/class/:id', security.role(privilege.student.list), (req, res) => {
    academyClass(req, res)
})

module.exports = router