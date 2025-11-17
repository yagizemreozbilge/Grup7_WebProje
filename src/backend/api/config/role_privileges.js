module.exports = {
    privGroups: [{
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "AVAILABILITIES",
            name: "Availability Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        },

        {
            id: "TENANTS",
            name: "Tenant Permissions"
        },
        {
            id: "FIELDS",
            name: "Field Permissions"
        },
        {
            id: "RESERVATIONS",
            name: "Reservation Permissions"
        },
        {
            id: "ADMINS",
            name: "Admin Permissions"
        }
    ],

    privileges: [{
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "User view"
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "User add"
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "User update"
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "User delete"
        },
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "Role view"
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "Role add"
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "Role update"
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "Role delete"
        },

        {
            key: "auditlogs_view",
            name: "AuditLogs View",
            group: "AUDITLOGS",
            description: "AuditLogs View"
        },
        {
            key: "field_view",
            name: "Field View",
            group: "FIELDS",
            description: "Field view"
        },
        {
            key: "field_add",
            name: "Field Add",
            group: "FIELDS",
            description: "Field add"
        },
        {
            key: "field_update",
            name: "Field Update",
            group: "FIELDS",
            description: "Field update"
        },
        {
            key: "field_delete",
            name: "Field Delete",
            group: "FIELDS",
            description: "Field delete"
        },
        {
            key: "reservation_view",
            name: "Reservation View",
            group: "RESERVATIONS",
            description: "Reservation view"
        },
        {
            key: "reservation_add",
            name: "Reservation Add",
            group: "RESERVATIONS",
            description: "Reservation add"
        },
        {
            key: "reservation_update",
            name: "Reservation Update",
            group: "RESERVATIONS",
            description: "Reservation update"
        },
        {
            key: "reservation_delete",
            name: "Reservation Delete",
            group: "RESERVATIONS",
            description: "Reservation delete"
        }
    ]
}