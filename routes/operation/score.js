const multer = require('multer')
const upload = multer()
const router = require('express').Router()
const { index, detail, create, disable, update, batch, _import, _delete } = require('../../controllers/scoreController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', (req, res) => {
    index(req, res)
})

router.get('/detail/:id', security.role(privilege.score.detail), (req, res) => {
    detail(req, res)
})

router.post('/create', security.role(privilege.score.create), (req, res) => {
    create(req, res)
})

router.put('/update/:id', security.role(privilege.score.update), (req, res) => {
    update(req, res)
})

router.delete('/disable/:id', security.role(privilege.score.delete), (req, res) => {
    disable(req, res)
})

router.delete('/delete/:id', security.role(privilege.score.delete), (req, res) => {
    _delete(req, res)
})

router.post('/excel/import', upload.single('excel'), (req, res) => {
    _import(req, res)
})

router.post('/batch', (req, res) => {
    batch(req, res)
})

module.exports = router