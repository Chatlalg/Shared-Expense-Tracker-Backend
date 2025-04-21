import connection_instance from "../db/connection_instance.js"
import { check_duplicate_id, get_all_pools, verify_pool_password } from "../tables/pool.tables.js"
import { insert_into_pool } from "../tables/pool.tables.js"
import { insert_into_pool_members, get_all_members } from "../tables/pool_members.tables.js"
import { Random } from "random-js"

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {{message: string, pool_id : string, pool_name : string, creation_date : string}} data of newly created pool
 */
const handle_create_pool = (req, res, next) => {
    const connection = connection_instance()
    const { pool_id, pool_name, pool_password, email } = req.body
    const creation_date = new Date().toISOString().slice(0, 10)

    connection.query(insert_into_pool(pool_id, pool_name, pool_password, creation_date), (err, results) => {
        if (err) return next(err)
        console.log(creation_date, results)
        connection.query(insert_into_pool_members(email, pool_id), (err2, results) => {
            if (err2) return next(err2)
            res.status(201).json({
                message: "Group successfully created",
                pool_id,
                pool_name,
                creation_date
            })
        })
    })
}

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {Array.<{pool_id: string, pool_name: string, creation_date: string, members: number}>} id, name, creation date, and total member count of each pool
 */
const handle_get_all_pools = (req, res, next) => {
    const connection = connection_instance()
    const email = req.body.email
    connection.query(get_all_pools(email), (err, results) => {
        console.log(email)
        if (err) return next(err)
        console.log(results)
        res.status(200).json(results)
    })
    connection.end((err) => {
        if (err) return next(err)
    })
}

/**
 * 
 * @param {string} id - pool id 
 * @returns {Promise} promise is resolved if pool exists
 */
const if_pool_id_exists = (id) => {
    return new Promise((resolve, reject) => {
        const connection = connection_instance()
        connection.query(check_duplicate_id(id), (err, results) => {
            if (err) return reject(err)
            resolve(results.length > 0)
        })
        connection.end((err) => {
            if (err) return next(err)
        })
    })
}

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {string} new pool id
 */
const handle_get_new_pool_id = async (req, res, next) => {
    const random = new Random();
    let value = random.integer(100000, 999999)
    while (await if_pool_id_exists(value)) {
        value = random.integer(100000, 999999)
    }
    // console.log("Group id: ", value)
    res.status(200).send(`${value}`)
}

/**
 * 
 * @param {string} pool_id - pool id
 * @param {string} pool_password - pool password
 * @returns {Promise} returns a boolean, true if correct credentials and false otherwise
 */
const verify_join_credentials = (pool_id, pool_password) => {
    return new Promise((resolve, reject) => {
        console.log(pool_id, pool_password)
        const connection = connection_instance()
        connection.query(verify_pool_password(pool_id, pool_password), (err, results) => {
            if (err) return reject(err)
            if (results.length == 0) return reject(false)
            resolve(true)
        })
    })
}

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {boolean} true if group successfully joined
 */
const handle_join_new_pool = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id, pool_password, email } = req.body
    if (await verify_join_credentials(pool_id, pool_password)) {
        connection.query(insert_into_pool_members(email, pool_id), (err, results) => {
            if (err) return next(err)
            res.status(201).json({
                message: `${email} joined pool : ${pool_id}`
            })
        })
    }
}


const handle_get_all_members = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id } = req.body
    console.log(pool_id)
    connection.query(get_all_members(), [pool_id], (err,results)=>{
        if(err) return next(err)
            console.log(results)
        res.status(200).json(results)
    })
}

export { if_pool_id_exists, handle_get_all_pools, handle_create_pool, handle_get_new_pool_id, handle_join_new_pool, handle_get_all_members }