//users.js

var express = require('express');
var router = express.Router();

const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles');

const Response = require('../lib/Response');
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const { HTTP_CODES } = require('../config/Enum');
const config = require("../config");
const auth = require('../lib/logger/auth')();

const DEFAULT_PLAYER_ROLE_ID = "690a455bd8be2c698c44152e";

const RolePrivileges = require('../db/models/RolePrivileges');
const privs = require('../config/role_privileges');


router.use((req, res, next) => {
    if (req.path === '/register' || req.path === '/auth') {
        return next();
    }
    auth.authenticate()(req, res, next);
});



router.post("/register", async(req,res) => {
  let body = req.body;
   try {

    if (!body.email) 
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be filled");

    if (!validator.isEmail(body.email)) 
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "email field must be an email format");

    if (!body.password) 
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password field must be filled");

    if (body.password.length < Enum.PASS_LENGTH.MIN) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password length must be greater than " + Enum.PASS_LENGTH.MIN);
    }


    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      body.roles = [DEFAULT_PLAYER_ROLE_ID];
    }

    let roles = await Roles.find({ _id: { $in: body.roles } });

    if (roles.length === 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "roles field must be valid");
    }

    const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

    let createdUser = await Users.create({
      email: body.email,
      password: hashedPassword,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number
    });

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        role_id: roles[i]._id,
        user_id: createdUser._id
      });
    }

    res.json(Response.successResponse({ success: true }));

  } catch(err) {
     let errorResponse = Response.errorResponse(err);
     return res.status(errorResponse.code).json(errorResponse);
  }
});


router.post("/auth", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (typeof Users.validateFieldsBeforeAuth === "function") {
      Users.validateFieldsBeforeAuth(email, password);
    }

    let user = await Users.findOne({ email });

    if (!user)
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Email or password wrong");

    if (typeof user.validPassword !== "function") {
      user.validPassword = (pass) => bcrypt.compareSync(pass, user.password);
    }

    if (!user.validPassword(password))
      throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Email or password wrong");

  
    let userRoles = await UserRoles.find({ user_id: user._id });

   
    let rolePrivileges = await RolePrivileges.find({
      role_id: { $in: userRoles.map(r => r.role_id) }
    });

    
    let permissions = rolePrivileges.map(rp => rp.permission);

    
    let payload = {
      id: user._id.toString(),
      roles: permissions,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
    };

    
    let token = jwt.sign(payload, config.JWT.SECRET);

    
    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      roles: permissions
    };

    res.json(Response.successResponse({ token, user: userData }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code).json(errorResponse);
  }
});

router.all("*", auth.authenticate(), (req, res, next) => next());



router.get("/", auth.checkRoles("users_view"), async (req, res) => {
  try {
    let users = await Users.find({})
      .populate({
        path: "roles",
        populate: {
          path: "role_id",
          model: "roles"
        }
      });

    res.json(Response.successResponse(users));
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    return res.status(errorResponse.code).json(errorResponse);
  }
});




router.post("/add", auth.checkRoles("users_add"),async(req,res) => {
  let body = req.body;
   try {

    if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!","email must be filled");
    if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!","password must be filled");  // FIX

    const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

    await Users.create({
      email: body.email,
      password:hashedPassword,
      is_active: true,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
     
    });

    return res.status(201).json({ message: "User created successfully" });

  } catch(err) {
     let errorResponse = Response.errorResponse(err);
return res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/update", auth.checkRoles("users_update"), async (req, res) => {
  try {
    let body = req.body;
    let updates = {};

    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");

    
    if (body.password) {   // FIX
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
    }

    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.first_name) updates.first_name = body.first_name;
    if (body.last_name) updates.last_name = body.last_name;
    if (body.phone_number) updates.phone_number = body.phone_number;

    if (req.user && body._id == req.user.id) {
      body.roles = null;
    }

    if (Array.isArray(body.roles) && body.roles.length > 0) {
      let userRoles = await UserRoles.find({ user_id: body._id });

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id.toString()));
      let newRoles = body.roles.filter(
        x => !userRoles.map(r => r.role_id.toString()).includes(x)
      );

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({
          _id: { $in: removedRoles.map(x => x._id.toString()) },
        });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            role_id: newRoles[i],
            user_id: body._id,
          });
          await userRole.save();
        }
      }
    }

    await Users.updateOne({ _id: body._id }, updates);

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});



router.post("/delete", auth.checkRoles("users_delete"),async (req, res) => {
  let body = req.body;
  try {
    if (!body._id)
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,"Validation Error!", "_id field must be filled");

    await Users.deleteOne({ _id: body._id }); 
    await UserRoles.deleteMany({user_id: body._id});

    res.json(Response.successResponse({ success: true }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


module.exports = router;