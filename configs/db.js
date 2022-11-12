const mongoose = require('mongoose')
const Role = require('../models/Role')
const User = require('../models/User')

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
})
.then(async () => {
    const totalUser = await User.count()
    if (totalUser > 0) return

    const ObjectId = mongoose.Types.ObjectId
    const { preRole } = require('../constants/roleMap')
    let superAdmin
    let username = 'Admin'

    Object.keys(preRole).forEach(menu => {
        superAdmin = {
            ...superAdmin,
            [menu]: {}
        }
        Object.keys(preRole[menu]).forEach(route => {
            superAdmin[menu][route] = true
        })
    })

    const role = await Role.create({ name: { English: 'Super Admin' }, privilege: superAdmin, isDefault: true })
    await Role.create({ _id: new ObjectId('88a28069b8f93e95a08367b8'), name: { English: 'Teacher' }, privilege: preRole, isDefault: true })
    await Role.create({ _id: new ObjectId('a7668e2a9ed48842855643cf'), name: { English: 'Student' }, privilege: preRole, isDefault: true })
    await User.create({
        username,
        password: `${username}${process.env.DEFAULT_PASSWORD}`,
        role: role._id,
        isDefault: true
    })
    console.log('Mongo Client is connected...')
})
.catch((error) => console.error(error))
