import { Router } from "express";
import error_handler from "../middlewares/error_handler.js";
import { handle_add_expense, handle_get_all_expenses, handle_get_total_expense } from "../controllers/expense.controllers.js";

const router = Router()

router.use((req, res,next) => {
    console.log(req.method, req.url)
    next()
})

router.route("/fetchall").post(handle_get_all_expenses)
router.route("/totalexpense").post(handle_get_total_expense)
router.route("/addexpense").post(handle_add_expense)

router.use(error_handler)
export default router