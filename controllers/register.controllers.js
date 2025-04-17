import connection_instance from "../db/connection_instance.js"
import { insert_into_user } from "../tables/user.tables.js"

const handle_register = (req, res, next) => {
    const email = req.body.email
    const connection = connection_instance()
    connection.query(insert_into_user(email),(err,results) => {
        if(err) return next(err)
        console.log(results)
        res.status(200).send("Successfully inserted new user")
    })
}

export { handle_register }