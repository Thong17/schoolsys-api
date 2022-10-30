const router = require('express').Router()
const { schoolReport, attendanceReport, academyReport } = require('../../controllers/dashboardController')

router.get('/school', (req, res) => {
    schoolReport(req, res)
})

router.get('/attendance', (req, res) => {
    attendanceReport(req, res)
})

router.get('/academy', (req, res) => {
    academyReport(req, res)
})

module.exports = router