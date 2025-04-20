import { Router } from "express";
import { handle_register } from "../controllers/user.controllers.js";
import { handle_get_all_pools } from "../controllers/pool.controllers.js";
import error_handler from "../middlewares/error_handler.js";

const router = Router()


router.use((req, res,next) => {
    console.log(req.method, req.url)
    next() 
})

router.route("/register").post(handle_register)
router.route("/home").post(handle_get_all_pools)

router.use(error_handler)
export default router