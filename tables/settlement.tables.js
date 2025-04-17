const settlement_table = `
    CREATE TABLE IF NOT EXISTS settlement(
        group_id INT,
        lender_email VARCHAR(255) NOT NULL,
        borrower_email VARCHAR(255) NOT NULL,
        outstanding_amount DECIMAL(10,2) NOT NULL CHECK(outstanding_amount > 0),
        FOREIGN KEY (group_id) REFERENCES pool(group_id) ON DELETE CASCADE
    )
`

export default settlement_table