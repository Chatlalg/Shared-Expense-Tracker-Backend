const settlement_table = `
    CREATE TABLE IF NOT EXISTS settlement (
        pool_id INT,
        lender_email VARCHAR(255) NOT NULL,
        borrower_email VARCHAR(255) NOT NULL,
        outstanding_amount DECIMAL(10,2) NOT NULL CHECK (outstanding_amount > 0),
        FOREIGN KEY (pool_id) REFERENCES pool(pool_id) ON DELETE CASCADE,
        FOREIGN KEY (lender_email) REFERENCES user(email) ON DELETE CASCADE,
        FOREIGN KEY (borrower_email) REFERENCES user(email) ON DELETE CASCADE,
        UNIQUE (pool_id, lender_email, borrower_email)
    )
`

const insert_into_settlement = () => {
    return `
        INSERT INTO settlement (pool_id, borrower_email, lender_email, outstanding_amount)
        VALUES (?,?,?,?)
        ON DUPLICATE KEY UPDATE outstanding_amount = outstanding_amount + VALUES(outstanding_amount)
    `
}

const check_reverse_settlement = () => {
    return `
      SELECT outstanding_amount FROM settlement 
      WHERE pool_id = ? AND lender_email = ? AND borrower_email = ?
    `
}

const update_settlements = () => {
    return `
      UPDATE settlement SET outstanding_amount = ?
      WHERE pool_id = ? AND lender_email = ? AND borrower_email = ?
    `
}

const delete_settlement = () => {
    return `
      DELETE FROM settlement
      WHERE pool_id = ? AND lender_email = ? AND borrower_email = ?
    `
}

export { settlement_table, insert_into_settlement, update_settlements, check_reverse_settlement, delete_settlement}