import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import {  adminLogin, changePassword, getUser, logout, refreshAccessToken, updateProfile, userLogin, userRegister } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.single("avatar"), userRegister) 
router.route("/login").post(userLogin)
router.route("/admin/login").post(adminLogin)

router.route("/logout").post(verifyJWT, logout)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT, changePassword)
    router.route("/getUser").get(verifyJWT, getUser)
    router.route("/update-account").patch(verifyJWT, updateProfile)

export default router