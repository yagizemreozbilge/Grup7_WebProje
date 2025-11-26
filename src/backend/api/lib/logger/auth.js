const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");

const Users = require('../../db/models/Users');
const UserRoles = require('../../db/models/UserRoles');
const RolePrivileges = require('../../db/models/RolePrivileges');
const Roles = require('../../db/models/Roles');

const config = require('../../config');


const Response = require('../../lib/Response');
const CustomError = require('../../lib/Error');

const { HTTP_CODES } = require('../../config/Enum');
 
const privs = require("../../config/role_privileges"); 

module.exports = function () {

    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, 
    async (payload, done) => {
        try {

            let user = await Users.findOne({ _id: payload.id });

            if (user) {

              
                let userRoles = await UserRoles.find({ user_id: payload.id });

             
                let rolePrivileges = await RolePrivileges.find({
                    role_id: { $in: userRoles.map(ur => ur.role_id) }
                });

                
                let privileges = rolePrivileges
                    .map(rp => privs.privileges.find(x => x.key === rp.permission))
                    .filter(x => x); 

                let roleDetails = await Roles.find({ _id: { $in: userRoles.map(ur => ur.role_id) } });
                return done(null, {
                    id: user._id,
                    roles: privileges,
                    role_ids: userRoles.map(ur => ur.role_id.toString()),
                    role_details: roleDetails.map(r => ({
                        id: r._id.toString(),
                        name: r.role_name
                    })),
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    exp: Math.floor(Date.now() / 1000) + config.JWT.EXPIRE_TIME 
                });

            } else {
                return done(new CustomError(HTTP_CODES.UNAUTHORIZED, "Authentication Error", "User not found"), null);
            }

        } catch (err) {
            return done(err, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },

        authenticate: function () {
            return passport.authenticate("jwt", { session: false });
        },

        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {

                if (!req.user || !req.user.roles) {
                    let response = Response.errorResponse(
                        new CustomError(
                            HTTP_CODES.FORBIDDEN,
                            "Authorization Error",
                            "User roles/privileges not found after authentication."
                        )
                    );
                    return res.status(response.code).json(response);
                }

                let privileges = req.user.roles.map(x => x.key);

                // Superuser veya Admin kontrolü (Her şeye yetkisi var)
                const isSuperUser = privileges.includes('superuser');
                const isSuperAdminRole = (req.user.role_details || []).some(r => {
                    const name = (r.name || '').toLowerCase();
                    return name.includes('admin') || name.includes('super');
                });

                if (isSuperUser || isSuperAdminRole) {
                    return next();
                }

                let i = 0;
                
                while (i < expectedRoles.length && !privileges.includes(expectedRoles[i])) {
                    i++;
                }

                if (i >= expectedRoles.length) {
                   
                    let response = Response.errorResponse(
                        new CustomError(
                            HTTP_CODES.FORBIDDEN,
                            "Authorization Error",
                            "Need Permission"
                        )
                    );
                    return res.status(response.code).json(response);
                }

                return next();
            };
        }
    };
};