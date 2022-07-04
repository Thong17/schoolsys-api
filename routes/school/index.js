const router = require('express').Router()

router.use('/student', require('./student'))
router.use('/teacher', require('./teacher'))

module.exports = router