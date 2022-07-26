const router = require('express').Router()
const { operation } = require('../../controllers/dashboardController')
const security = require('../../middleware/security')
const { privilege } = require('../../constants/roleMap')

router.get('/', (req, res) => {
    operation(req, res)
})

module.exports = router