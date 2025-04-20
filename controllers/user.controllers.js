import connection_instance from "../db/connection_instance.js"
import { insert_into_user } from "../tables/user.tables.js"

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function 
 * - controller to create new user in the database
 */
const handle_register = (req, res, next) => {
    const email = req.body.email
    const username = req.body.username
    const connection = connection_instance()
    connection.query(insert_into_user(email, username), (err, results) => {
        if (err) return next(err)
        console.log(results)
        res.status(200).send("new user created")
    })  
    connection.end((err) => {
        if (err) return next(err)
    })
}

export { handle_register }