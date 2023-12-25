import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { userRegister } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(upload.single("avatar"), userRegister)

export default router