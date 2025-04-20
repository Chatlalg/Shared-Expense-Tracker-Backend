import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({limit:"16kb"}))

import user_router from "./routes/user.routes.js"
import pool_router from "./routes/pool.routes.js"
app.use("/api/v1/user",user_router)
app.use("/api/v1/group",pool_router)
export { app }