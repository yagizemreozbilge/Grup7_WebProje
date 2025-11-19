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
        },

        {
            key: "tenants_view",
            name: "Tenants View",
            group: "TENANTS",
            description: "Tenants view"
        },
        {
            key: "tenants_add",
            name: "Tenants Add",
            group: "TENANTS",
            description: "Tenants add"
        },
        {
            key: "tenants_update",
            name: "Tenants Update",
            group: "TENANTS",
            description: "Tenants update"
        },
        {
            key: "tenants_delete",
            name: "Tenants Delete",
            group: "TENANTS",
            description: "Tenants delete"
        },

        {
            key: "availabilities_view",
            name: "Availabilities View",
            group: "AVAILABILITIES",
            description: "Availabilities view"
        },
        {
             key: "availabilities_add",
            name: "Availabilities Add",
            group: "AVAILABILITIES",
            description: "Availabilities add"
        },
        {
             key: "availabilities_update",
            name: "Availabilities Update",
            group: "AVAILABILITIES",
            description: "Availabilities update"
        },
        {
             key: "availabilities_delete",
            name: "Availabilities Delete",
            group: "AVAILABILITIES",
            description: "Availabilities delete"
        },

        {
            key: "customers_view",
            name: "Customers View",
            group: "CUSTOMERS",
            description: "Customers view"
        },
        {
             key: "customers_add",
            name: "Availabilities Add",
            group: "CUSTOMERS",
            description: "Customers add"
        },
        {
             key: "customers_update",
            name: "Availabilities Update",
            group: "CUSTOMERS",
            description: "Customers update"
        },
        {
             key: "customers_delete",
            name: "Availabilities Delete",
            group: "CUSTOMERS",
            description: "Customers delete"
        },

        {
            key: "admins_view",
            name: "Admins View",
            group: "ADMINS",
            description: "Admins view"
        },
        {
             key: "admins_add",
            name: "Availabilities Add",
            group: "ADMINS",
            description: "Admins add"
        },
        {
             key: "admins_update",
            name: "Availabilities Update",
            group: "ADMINS",
            description: "Admins update"
        },
        {
             key: "admins_delete",
            name: "Availabilities Delete",
            group: "ADMINS",
            description: "Admins delete"
        },

        
    ]
}