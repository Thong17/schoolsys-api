const router = require('express').Router()
const { profile, changeTheme, changeLanguage, passwordUpdate } = require('../../controllers/userController')
const security = require('../../middleware/security')

router.get('/profile', (req, res) => {
    profile(req, res)
})

router.post('/theme/change', (req, res) => {
    changeTheme(req, res)
})

router.put('/change-password/:id', security.self, (req, res) => {
    passwordUpdate(req, res)
})

router.post('/language/change', (req, res) => {
    changeLanguage(req, res)
})

module.exports = router