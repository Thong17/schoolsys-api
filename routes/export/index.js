const router = require('express').Router()
const { attendanceClass } = require('../../controllers/exportController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.post('/attendance/class/:id', security.role(privilege.student.list), (req, res) => {
    attendanceClass(req, res)
})

module.exports = router