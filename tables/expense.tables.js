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
        SELECT u.username, u.lender_email, e.expense_id, e.description, e.creation_date
        FROM user as u
        JOIN expense as e
        ON u.email = e.lender_email
        WHERE e.pool_id = 'pool_id'
    `
 */
const get_all_expenses = (pool_id) => {
    return `
        SELECT u.username, e.lender_email, e.expense_id, e.amount, e.description, e.creation_date
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

const insert_into_expense = (lender_email,amount, description,pool_id,creation_date) => {
    return `
        INSERT INTO expense (lender_email, amount, description, pool_id, creation_date)
        VALUES ('${lender_email}','${amount}','${description}','${pool_id}','${creation_date}')
    `
}

const get_expense_borrowers = (expense_id) => {
    return `
        SELECT u.username, s.split_amount as share_amount
        FROM user as u
        JOIN split as s
        ON u.email = s.borrower_email
        WHERE s.expense_id = '${expense_id}'
    `
}

export { expense_table, get_all_expenses, get_total_expense, insert_into_expense, get_expense_borrowers }