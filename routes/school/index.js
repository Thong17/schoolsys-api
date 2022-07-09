const router = require('express').Router()

router.use('/student', require('./student'))
router.use('/teacher', require('./teacher'))
router.use('/grade', require('./grade'))

module.exports = router