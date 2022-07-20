const router = require('express').Router()

router.use('/score', require('./score'))
router.use('/attendance', require('./attendance'))


module.exports = router