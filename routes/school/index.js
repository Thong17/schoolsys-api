const router = require('express').Router()

router.use('/student', require('./student'))
router.use('/teacher', require('./teacher'))
router.use('/grade', require('./grade'))
router.use('/subject', require('./subject'))

module.exports = router