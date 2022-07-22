const router = require('express').Router()
const { admin } = require('../../controllers/dashboardController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.role.list), (req, res) => {
    admin(req, res)
})

module.exports = router