const router = require('express').Router()
const { report } = require('../../controllers/dashboardController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', security.role(privilege.role.list), (req, res) => {
    report(req, res)
})

module.exports = router