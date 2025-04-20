const pool_members_table = `
    CREATE TABLE IF NOT EXISTS pool_members(
        email VARCHAR(255),
        pool_id INT,
        PRIMARY KEY (email, pool_id),
        FOREIGN KEY (email) REFERENCES user(email) ON DELETE CASCADE,
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE
    )
`

/**
 * 
 * @param {string} email - email
 * @param {string} pool_id - pool id
 * @returns 
 *    INSERT INTO pool_members (email, pool_id)
      VALUES ('email', 'pool_id')
 */
const insert_into_pool_members = (email, pool_id) => {
    return `
      INSERT INTO pool_members (email, pool_id)
      VALUES ('${email}', '${pool_id}')
    `
}

export { pool_members_table, insert_into_pool_members }

