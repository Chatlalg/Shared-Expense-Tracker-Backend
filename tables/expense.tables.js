const expense_table = `
    CREATE TABLE IF NOT EXISTS expense(
        expense_id INT PRIMARY KEY AUTO_INCREMENT,
        amount DECIMAL(10,2) NOT NULL CHECK(amount>0),
        description TEXT,
        pool_id INT,
        lender_email VARCHAR(255),
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE,
        FOREIGN KEY (lender_email) REFERENCES user(email) ON DELETE CASCADE
    )
`

export { expense_table }