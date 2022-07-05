const mongoose = require('mongoose')
const Role = require('../models/Role')

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
})
.then(async () => {
    const totalRole = await Role.count({ isDisabled: false })
    if (totalRole > 0) return

    const ObjectId = mongoose.Types.ObjectId
    const { preRole } = require('../constants/roleMap')
    let superAdmin

    Object.keys(preRole).forEach(menu => {
        superAdmin = {
            ...superAdmin,
            [menu]: {}
        }
        Object.keys(preRole[menu]).forEach(route => {
            superAdmin[menu][route] = true
        })
    })

    await Role.create({ name: { English: 'Super Admin' }, privilege: superAdmin, description: 'Default role generated by system', isDefault: true })
    await Role.create({ _id: new ObjectId('88a28069b8f93e95a08367b8'), name: { English: 'Teacher' }, privilege: preRole, description: 'Default role generated by system', isDefault: true })
    await Role.create({ _id: new ObjectId('a7668e2a9ed48842855643cf'), name: { English: 'Student' }, privilege: preRole, description: 'Default role generated by system', isDefault: true })
    console.log('Mongo Client is connected...')
})
.catch((error) => console.error(error))
