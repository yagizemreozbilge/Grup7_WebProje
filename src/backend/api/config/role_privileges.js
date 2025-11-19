// role_privileges.js 
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
            key: "users_view",
            name: "Users View",
            group: "USERS",
            description: "Users view"
        },
        {
            key: "users_add",
            name: "Users Add",
            group: "USERS",
            description: "Users add"
        },
        {
            key: "users_update",
            name: "Users Update",
            group: "USERS",
            description: "Users update"
        },
        {
            key: "users_delete",
            name: "Users Delete",
            group: "USERS",
            description: "Users delete"
        },

       
        {
            key: "roles_view",
            name: "Roles View",
            group: "ROLES",
            description: "Roles view"
        },
        {
            key: "roles_add",
            name: "Roles Add",
            group: "ROLES",
            description: "Roles add"
        },
        {
            key: "roles_update",
            name: "Roles Update",
            group: "ROLES",
            description: "Roles update"
        },
        {
            key: "roles_delete",
            name: "Roles Delete",
            group: "ROLES",
            description: "Roles delete"
        },

        
        {
            key: "availabilities_manage",
            name: "Availabilities Manage",
            group: "AVAILABILITIES",
            description: "Allows managing field availabilities."
        },

        {
            key: "auditlogs_view",
            name: "AuditLogs View",
            group: "AUDITLOGS",
            description: "AuditLogs View"
        },

        
        {
            key: "superuser",
            name: "Superuser (Full Access)",
            group: "ADMINS",
            description: "Grants full access to all features (used by middleware)."
        },
        
        {
            key: "fields_view",
            name: "Fields View",
            group: "FIELDS",
            description: "Fields view"
        },
        {
            key: "fields_add",
            name: "Fields Add",
            group: "FIELDS",
            description: "Fields add"
        },
        {
            key: "fields_update",
            name: "Fields Update",
            group: "FIELDS",
            description: "Fields update"
        },
        {
            key: "fields_delete",
            name: "Fields Delete",
            group: "FIELDS",
            description: "Fields delete"
        },

       
        {
            key: "reservations_view",
            name: "Reservations View",
            group: "RESERVATIONS",
            description: "Reservations view"
        },
        {
            key: "reservations_add",
            name: "Reservations Add",
            group: "RESERVATIONS",
            description: "Reservations add"
        },
        {
            key: "reservations_update",
            name: "Reservations Update",
            group: "RESERVATIONS",
            description: "Reservations update"
        },
        {
            key: "reservations_delete",
            name: "Reservations Delete",
            group: "RESERVATIONS",
            description: "Reservations delete"
        },
        {
            key: "reservations_approve",
            name: "Reservations Approve/Reject",
            group: "RESERVATIONS",
            description: "Allows approval or rejection of reservations."
        }
    ]
}