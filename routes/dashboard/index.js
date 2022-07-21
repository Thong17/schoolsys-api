const router = require('express').Router()

router.use('/operation', require('./operation'))

module.exports = router