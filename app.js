import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))

import user_router from "./routes/user.routes.js"
import pool_router from "./routes/pool.routes.js"
import expense_router from "./routes/expense.routes.js"
app.use("/api/v1/user",user_router)
app.use("/api/v1/group",pool_router)
app.use("/api/v1/expense",expense_router)
export { app }