const multer = require('multer')
const upload = multer()
const router = require('express').Router()
const { index, detail, create, disable, update, batch, _import, updateFamily, updateApplication, updateHealth, selectApplied } = require('../../controllers/studentController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.student.list), (req, res) => {
    index(req, res)
})

router.get('/detail/:id', security.role(privilege.student.detail), (req, res) => {
    detail(req, res)
})

router.post('/create', security.role(privilege.student.create), (req, res) => {
    create(req, res)
})

router.put('/update/:id', security.role(privilege.student.update), (req, res) => {
    update(req, res)
})

router.delete('/disable/:id', security.role(privilege.student.delete), (req, res) => {
    disable(req, res)
})

router.post('/excel/import', upload.single('excel'), (req, res) => {
    _import(req, res)
})

router.post('/batch', (req, res) => {
    batch(req, res)
})

router.put('/family/:id', (req, res) => {
    updateFamily(req, res)
})

router.put('/application/:id', (req, res) => {
    updateApplication(req, res)
})

router.put('/health/:id', (req, res) => {
    updateHealth(req, res)
})

router.get('/applied/:classId', (req, res) => {
    selectApplied(req, res)
})

module.exports = router