const router = require('express').Router()

router.use('/auth', require('./auth/auth'))
router.use('/shared', require('./shared'))
router.use(require('../middleware/security').auth)
router.use('/admin', require('./admin'))
router.use('/user', require('./user'))
router.use('/school', require('./school'))
router.use('/operation', require('./operation'))
router.use('/dashboard', require('./dashboard'))
router.use('/export', require('./export'))

module.exports = router