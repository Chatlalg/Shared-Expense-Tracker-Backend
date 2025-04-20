const expense_table = `
    CREATE TABLE IF NOT EXISTS expense(
        expense_id INT PRIMARY KEY AUTO_INCREMENT,
        amount DECIMAL(10,2) NOT NULL CHECK(amount>0),
        description TEXT,
        pool_id INT,
        lender_email VARCHAR(255),
        creation_date DATE,
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE,
        FOREIGN KEY (lender_email) REFERENCES user(email) ON DELETE CASCADE
    )
`
/**
 * 
 * @param {string} pool_id - pool id
 * @returns `
        SELECT u.username, u.email, e.expense_id, e.description, e.pool_id, e.creation_date
        FROM user as u
        JOIN expense as e
        ON u.email = e.lender_email
        WHERE e.pool_id = 'pool_id'
    `
 */
const get_all_expenses = (pool_id) => {
    return `
        SELECT u.username, u.email, e.expense_id, e.amount, e.description, e.pool_id, e.creation_date
        FROM user as u
        JOIN expense as e
        ON u.email = e.lender_email
        WHERE e.pool_id = '${pool_id}'
    `
}

/**
 * 
 * @param {string} pool_id pool id
 * @returns `
        SELECT SUM(amount)
        FROM expense
        WHERE pool_id = 'pool_id'
    `
 */
const get_total_expense = (pool_id) => {
    return `
        SELECT SUM(amount) as total_expense
        FROM expense
        WHERE pool_id = '${pool_id}'
    `
}

export { expense_table, get_all_expenses, get_total_expense }