exports.privilege = {
    menu: {
        operation: {
            route: 'menu',
            action: 'operation'
        },
        school: {
            route: 'menu',
            action: 'school'
        },
        admin: {
            route: 'menu',
            action: 'admin'
        },
        report: {
            route: 'menu',
            action: 'report'
        },
        config: {
            route: 'menu',
            action: 'config'
        },
        attendance: {
            route: 'menu',
            action: 'attendance'
        },
        academy: {
            route: 'menu',
            action: 'academy'
        },
        class: {
            route: 'menu',
            action: 'class'
        },
        grade: {
            route: 'menu',
            action: 'grade'
        },
        student: {
            route: 'menu',
            action: 'student'
        },
        teacher: {
            route: 'menu',
            action: 'teacher'
        },
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
            route: 'student',
            action: 'list'
        },
        detail: {
            route: 'student',
            action: 'detail'
        },
        create: {
            route: 'student',
            action: 'create'
        },
        update: {
            route: 'student',
            action: 'update'
        },
        delete: {
            route: 'student',
            action: 'delete'
        }
    },
    teacher: {
        list: {
            route: 'teacher',
            action: 'list'
        },
        detail: {
            route: 'teacher',
            action: 'detail'
        },
        create: {
            route: 'teacher',
            action: 'create'
        },
        update: {
            route: 'teacher',
            action: 'update'
        },
        delete: {
            route: 'teacher',
            action: 'delete'
        }
    },
    grade: {
        list: {
            route: 'grade',
            action: 'list'
        },
        detail: {
            route: 'grade',
            action: 'detail'
        },
        create: {
            route: 'grade',
            action: 'create'
        },
        update: {
            route: 'grade',
            action: 'update'
        },
        delete: {
            route: 'grade',
            action: 'delete'
        }
    },
    subject: {
        list: {
            route: 'subject',
            action: 'list'
        },
        detail: {
            route: 'subject',
            action: 'detail'
        },
        create: {
            route: 'subject',
            action: 'create'
        },
        update: {
            route: 'subject',
            action: 'update'
        },
        delete: {
            route: 'subject',
            action: 'delete'
        }
    },
    class: {
        list: {
            route: 'class',
            action: 'list'
        },
        detail: {
            route: 'class',
            action: 'detail'
        },
        create: {
            route: 'class',
            action: 'create'
        },
        update: {
            route: 'class',
            action: 'update'
        },
        delete: {
            route: 'class',
            action: 'delete'
        },
        graduate: {
            route: 'class',
            action: 'graduate'
        },
        start: {
            route: 'class',
            action: 'start'
        }
    },
    score: {
        create: {
            route: 'score',
            action: 'create'
        },
        delete: {
            route: 'score',
            action: 'delete'
        }
    },
    attendance: {
        list: {
            route: 'attendance',
            action: 'list'
        },
        detail: {
            route: 'attendance',
            action: 'detail'
        },
        checkIn: {
            route: 'attendance',
            action: 'checkIn'
        },
        checkOut: {
            route: 'attendance',
            action: 'checkOut'
        },
        permission: {
            route: 'attendance',
            action: 'permission'
        },
        reset: {
            route: 'attendance',
            action: 'reset'
        },
        report: {
            route: 'attendance',
            action: 'report'
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

