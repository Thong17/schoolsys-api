exports.privilege = {
    admin: {
        list: {
            route: 'admin',
            action: 'list'
        },
        detail: {
            route: 'admin',
            action: 'detail'
        },
        create: {
            route: 'admin',
            action: 'create'
        },
        update: {
            route: 'admin',
            action: 'update'
        },
        delete: {
            route: 'admin',
            action: 'delete'
        }
    },
    user: {
        list: {
            route: 'user',
            action: 'list'
        },
        detail: {
            route: 'user',
            action: 'detail'
        },
        create: {
            route: 'user',
            action: 'create'
        },
        update: {
            route: 'user',
            action: 'update'
        },
        delete: {
            route: 'user',
            action: 'delete'
        }
    },
    role: {
        list: {
            route: 'role',
            action: 'list'
        },
        detail: {
            route: 'role',
            action: 'detail'
        },
        create: {
            route: 'role',
            action: 'create'
        },
        update: {
            route: 'role',
            action: 'update'
        },
        delete: {
            route: 'role',
            action: 'delete'
        }
    },
    student: {
        list: {
            route: 'user',
            action: 'list'
        },
        detail: {
            route: 'user',
            action: 'detail'
        },
        create: {
            route: 'user',
            action: 'create'
        },
        update: {
            route: 'user',
            action: 'update'
        },
        delete: {
            route: 'user',
            action: 'delete'
        }
    },
    teacher: {
        list: {
            route: 'user',
            action: 'list'
        },
        detail: {
            route: 'user',
            action: 'detail'
        },
        create: {
            route: 'user',
            action: 'create'
        },
        update: {
            route: 'user',
            action: 'update'
        },
        delete: {
            route: 'user',
            action: 'delete'
        }
    },
    grade: {
        list: {
            route: 'user',
            action: 'list'
        },
        detail: {
            route: 'user',
            action: 'detail'
        },
        create: {
            route: 'user',
            action: 'create'
        },
        update: {
            route: 'user',
            action: 'update'
        },
        delete: {
            route: 'user',
            action: 'delete'
        }
    },
}

let role
const roles = Object.keys(this.privilege)
roles.forEach(p => {
    role = {
        ...role,
        [p]: {}
    }
    Object.keys(this.privilege[p]).forEach(k => {
        role[p][k] = false
    })
})

exports.preRole = role

