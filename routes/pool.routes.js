import { Router } from "express";
import error_handler from "../middlewares/error_handler.js";
import { handle_get_new_pool_id, handle_create_pool, handle_join_new_pool, handle_get_all_members } from "../controllers/pool.controllers.js";
const router = Router()

// logging route
router.use((req, res,next) => {
    console.log(req.method, req.url)
    next() // without next(), aagewale route-path hit nahi honge
})

router.route("/create").post(handle_create_pool)
router.route("/getnewgroupid").get(handle_get_new_pool_id)
router.route("/join").post(handle_join_new_pool)
router.route("/getallmembers").post(handle_get_all_members)

router.use(error_handler)
export default router