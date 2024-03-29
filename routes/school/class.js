const multer = require('multer')
const upload = multer()
const router = require('express').Router()
const { index, list, detail, create, update, batch, _import, removeStudent, rejectApplied, acceptApplied, listStudent, listSubject, graduate, enable, _delete } = require('../../controllers/classController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.class.list), (req, res) => {
    index(req, res)
})

router.get('/list', (req, res) => {
    list(req, res)
})

router.get('/detail/:id', security.role(privilege.class.detail), (req, res) => {
    detail(req, res)
})

router.post('/create', security.role(privilege.class.create), (req, res) => {
    create(req, res)
})

router.put('/update/:id', security.role(privilege.class.update), (req, res) => {
    update(req, res)
})

router.delete('/delete/:id', security.role(privilege.class.delete), (req, res) => {
    _delete(req, res)
})

router.post('/excel/import', upload.single('excel'), (req, res) => {
    _import(req, res)
})

router.post('/batch', (req, res) => {
    batch(req, res)
})

router.put('/accept/applied/:id', security.role(privilege.class.update), (req, res) => {
    acceptApplied(req, res)
})

router.delete('/reject/applied/:id', security.role(privilege.class.delete), (req, res) => {
    rejectApplied(req, res)
})

router.delete('/student/remove/:id', security.role(privilege.class.delete), (req, res) => {
    removeStudent(req, res)
})

router.get('/:id/student', security.role(privilege.class.list), (req, res) => {
    listStudent(req, res)
})

router.get('/:id/subject', security.role(privilege.class.list), (req, res) => {
    listSubject(req, res)
})

router.put('/graduate/:id', security.role(privilege.class.graduate), (req, res) => {
    graduate(req, res)
})

router.put('/enable/:id', security.role(privilege.class.start), (req, res) => {
    enable(req, res)
})


module.exports = router