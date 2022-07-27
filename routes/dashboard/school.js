const router = require('express').Router()
const { school } = require('../../controllers/dashboardController')

router.get('/', (req, res) => {
    school(req, res)
})

module.exports = router