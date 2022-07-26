const router = require('express').Router()
const { schoolReport, attendanceReport } = require('../../controllers/dashboardController')

router.get('/school', (req, res) => {
    schoolReport(req, res)
})

router.get('/attendance', (req, res) => {
    attendanceReport(req, res)
})

module.exports = router