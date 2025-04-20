const payment_table = `
    CREATE TABLE IF NOT EXISTS payment (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        pool_id INT NOT NULL,
        lender_email VARCHAR(255) NOT NULL,
        borrower_email VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE,
        FOREIGN KEY (lender_email) REFERENCES user(email) ON DELETE CASCADE,
        FOREIGN KEY (borrower_email) REFERENCES user(email) ON DELETE CASCADE
    )
`

export { payment_table }