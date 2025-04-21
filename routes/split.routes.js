import { Router } from "express";
import error_handler from "../middlewares/error_handler.js";
import { handle_get_settlements, handle_make_payment } from "../controllers/split.controllers.js";

const router = Router()

router.use((req, res,next) => {
    console.log(req.method, req.url)
    next()
})

router.route("/settlements").post(handle_get_settlements)
router.route("/pay").post(handle_make_payment)

router.use(error_handler)
export default router 