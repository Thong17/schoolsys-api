const multer = require('multer')
const upload = multer()
const router = require('express').Router()
const { index, list, detail, create, disable, update, batch, _import } = require('../../controllers/gradeController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.grade.list), (req, res) => {
    index(req, res)
})

router.get('/list', (req, res) => {
    list(req, res)
})

router.get('/detail/:id', security.role(privilege.grade.detail), (req, res) => {
    detail(req, res)
})

router.post('/create', security.role(privilege.grade.create), (req, res) => {
    create(req, res)
})

router.put('/update/:id', security.role(privilege.grade.update), (req, res) => {
    update(req, res)
})

router.delete('/disable/:id', security.role(privilege.grade.delete), (req, res) => {
    disable(req, res)
})

router.post('/excel/import', upload.single('excel'), (req, res) => {
    _import(req, res)
})

router.post('/batch', (req, res) => {
    batch(req, res)
})

module.exports = router