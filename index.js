import dotenv from "dotenv"
import {connectDB} from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./.env"
})

connectDB()
app.listen(process.env.PORT,'0.0.0.0',(err)=>{
    if(err) throw new Error(`SERVER DOWN: ${err}`)
    console.log(`Listening on PORT: ${process.env.PORT}`)
})


