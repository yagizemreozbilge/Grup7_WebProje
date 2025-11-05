// routes/roles.js
const express = require('express');
const router = express.Router();

const Roles = require("../db/models/Roles");
const RolePrivileges = require("../db/models/RolePrivileges");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum")
const { HTTP_CODES } = require('../config/Enum');
const role_privileges = require("../config/role_privileges");

const auth = require('../lib/logger/auth')();


/*router.all("*",auth.authenticate(), (req,rest,next) => {
    next();
})*/

router.get("/", /*auth.checkRoles("roles_view")*/ async (req, res) => {
  try {
    let roles = await Roles.find({});
    res.json(Response.successResponse(roles));
  } catch(err) {
     let errorResponse = Response.errorResponse(err);
return res.status(errorResponse.code).json(errorResponse);
  }
});


router.post("/add", /*auth.checkRoles("roles_add")*/ async(req,res) => {
  let body = req.body;
   try {
    if(!body.role_name) throw CustomError(Enum,HTTP_CODES.BAD_REQUEST, "Validation Error!", "role_name field must be fiiled");
    if(!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0) {
      throw CustomError(Enum,HTTP_CODES.BAD_REQUEST, "Validation Error!", "permission field must be an Array");
    }

    const exists = await Roles.findOne({ role_name: body.role_name });
    if (exists) {
      throw new CustomError(
        Enum.HTTP_CODES.CONFLICT,
        "Already exists!",
        "This role_name is already in use."
      );
    }

    let role = new Roles({
      role_name: body.role_name,
      is_active: true,
      created_by: req.user?.id
      
    });

    await role.save();

    for(let i=0; i<body.permissions.length; i++) {
      let priv = new RolePrivileges({
        role_id: role._id,
        permission:body.permissions[i],
        created_by: req.user?.id
      })
      await priv.save();
    }
    res.json(Response.successResponse({success: true}));
  } catch(err) {
     let errorResponse = Response.errorResponse(err);
return res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/update", auth.checkRoles("roles_update"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

    let updates = {};

    if (body.role_name) updates.role_name = body.role_name;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    if(!body.permissions && !Array.isArray(body.permissions) && body.permissions.length > 0) {

      let permission = await RolePrivileges.find({role_id: body._id});

      
      let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permissions));
      let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

      if(removedPermissions.length>0) {
        await RolePrivileges.privileges.remove({_id:{$in: removedPermissions.map(x=> x.id)}});
      }

       if(newPermissions.length>0) {
         for(let i=0; i<body.permissions.length; i++) {
      let priv = new RolePrivileges({
        role_id: role._id,
        permission:body.permissions[i],
        created_by: req.user?.id
      });
      await priv.save();
    }
      }
     
    }

    

    await Roles.updateOne({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/delete",  auth.checkRoles("roles_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");

    await Roles.deleteOne({ _id: body._id }); 

    res.json(Response.successResponse({ success: true }));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.get("/role_privileges", async(req,res) => {
  res.json(role_privileges);
})


module.exports = router; 
