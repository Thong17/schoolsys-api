const multer = require('multer')
const upload = multer()
const router = require('express').Router()
const { index, report, detail, checkIn, disable, checkOut, permission, batch, _import, _delete, reset, checkInAll, checkOutAll, resetAll } = require('../../controllers/attendanceController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.attendance.list), (req, res) => {
    index(req, res)
})

router.get('/report/:classId', security.role(privilege.attendance.list), (req, res) => {
    report(req, res)
})

router.get('/detail/:userId', security.role(privilege.attendance.report), (req, res) => {
    detail(req, res)
})

router.post('/checkIn', security.role(privilege.attendance.checkIn), (req, res) => {
    checkIn(req, res)
})

router.post('/permission', security.role(privilege.attendance.permission), (req, res) => {
    permission(req, res)
})

router.put('/checkOut/:id', security.role(privilege.attendance.checkOut), (req, res) => {
    checkOut(req, res)
})

router.put('/reset/:id', security.role(privilege.attendance.reset), (req, res) => {
    reset(req, res)
})

router.delete('/disable/:id', security.role(privilege.attendance.delete), (req, res) => {
    disable(req, res)
})

router.delete('/delete/:id', security.role(privilege.attendance.delete), (req, res) => {
    _delete(req, res)
})

router.post('/excel/import', upload.single('excel'), (req, res) => {
    _import(req, res)
})

router.post('/batch', (req, res) => {
    batch(req, res)
})

router.post('/checkInAll/:classId', security.role(privilege.attendance.checkIn), (req, res) => {
    checkInAll(req, res)
})

router.put('/checkOutAll/:classId', security.role(privilege.attendance.checkOut), (req, res) => {
    checkOutAll(req, res)
})

router.put('/resetAll/:classId', security.role(privilege.attendance.reset), (req, res) => {
    resetAll(req, res)
})

module.exports = router