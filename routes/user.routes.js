import { Router } from "express";
import { handle_register } from "../controllers/register.controllers.js";
import error_handler from "../middlewares/error_handler.js";

const router = Router()

// logging route
router.use((req, res,next) => {
    console.log('%s %s' , req.method, req.url)
    next() // without next(), aagewale route-path hit nahi honge
})

router.route("/register").post(handle_register)
router.use(error_handler)
export default router