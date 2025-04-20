const settlement_table = `
    CREATE TABLE IF NOT EXISTS settlement(
        pool_id INT,
        lender_email VARCHAR(255) NOT NULL,
        borrower_email VARCHAR(255) NOT NULL,
        outstanding_amount DECIMAL(10,2) NOT NULL CHECK(outstanding_amount > 0),
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE
    )
`

export { settlement_table }