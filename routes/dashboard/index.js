const router = require('express').Router()

router.use('/operation', require('./operation'))
router.use('/admin', require('./admin'))
router.use('/school', require('./school'))

module.exports = router