const router = require('express').Router()
const { schoolReport, attendanceReport } = require('../../controllers/dashboardController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/school', security.role(privilege.role.list), (req, res) => {
    schoolReport(req, res)
})

router.get('/attendance', security.role(privilege.role.list), (req, res) => {
    attendanceReport(req, res)
})

module.exports = router