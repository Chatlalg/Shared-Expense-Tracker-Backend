import connection_instance from "../db/connection_instance.js"
import { get_all_expenses } from "../tables/expense.tables.js"

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {Array.<{username,email, expense_id, description, pool_id, creation_date}>}
 */
const handle_get_all_expenses = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id } = req.body
    connection.query(get_all_expenses(pool_id),(err,results)=>{
        if(err) return next(err)
        res.status(200).json(results)
    })
} 

export { handle_get_all_expenses }