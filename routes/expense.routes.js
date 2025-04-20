import { Router } from "express";
import error_handler from "../middlewares/error_handler.js";
import { handle_get_all_expenses } from "../controllers/expense.controllers.js";

const router = Router()

router.use((req, res,next) => {
    console.log(req.method, req.url)
    next()
})

router.route("/fetchall").post(handle_get_all_expenses)

router.use(error_handler)
export default router