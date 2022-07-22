const router = require('express').Router()

router.use('/operation', require('./operation'))
router.use('/admin', require('./admin'))
router.use('/school', require('./school'))
router.use('/report', require('./report'))

module.exports = router