const router = require('express').Router()

router.use('/class', require('./class'))
router.use('/score', require('./score'))


module.exports = router