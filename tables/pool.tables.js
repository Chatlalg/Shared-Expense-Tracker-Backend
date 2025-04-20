const pool_table = `
    CREATE TABLE IF NOT EXISTS pool(
        pool_id INT PRIMARY KEY,
        pool_name VARCHAR(255),
        pool_password VARCHAR(255),
        creation_date DATE NOT NULL
    )
`
const get_all_pools = (email) => {
    return `
        SELECT 
            p.pool_id,
            p.pool_name,
            p.creation_date,
            (
            SELECT COUNT(*)
            FROM pool_members pm2
            WHERE pm2.pool_id = p.pool_id
            ) AS total_members
        FROM pool p
        JOIN pool_members pm
        ON p.pool_id = pm.pool_id
        AND pm.email = '${email}'
    `
}

/**
 * 
 * @param {string} pool_id 
 * @param {string} pool_name 
 * @param {string} pool_password 
 * @param {string} creation_date 
 * @returns {query} `
        INSERT INTO pool (pool_id, pool_name, pool_password, creation_date)
        VALUES (pool_id, pool_name, pool_password, creation_date)
    `
 */
const insert_into_pool = (pool_id, pool_name, pool_password, creation_date) => {
    return `
        INSERT INTO pool (pool_id, pool_name, pool_password, creation_date)
        VALUES ('${pool_id}', '${pool_name}','${pool_password}', '${creation_date}')
    `
}

const check_duplicate_id = (pool_id) => {
    return `
        SELECT *
        FROM pool
        WHERE pool_id = '${pool_id}'
    `
}


/**
 * 
 * @param {string} pool_id - pool id
 * @param {string} pool_password - pool password
 * @returns
        SELECT pool_id 
        FROM pool
        WHERE pool_id = 'pool_id' AND pool_password = 'pool_password' 
 */
const verify_pool_password = (pool_id, pool_password) => {
    return `
        SELECT pool_id 
        FROM pool
        WHERE pool_id = '${pool_id}' AND pool_password = '${pool_password}'
    `
}



export { pool_table, get_all_pools, insert_into_pool, check_duplicate_id, verify_pool_password }