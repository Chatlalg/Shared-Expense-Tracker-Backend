const split_table = `
    CREATE TABLE IF NOT EXISTS split(
        split_id INT PRIMARY KEY AUTO_INCREMENT,
        split_amount DECIMAL(10,2) NOT NULL CHECK(split_amount>0),
        borrower_email VARCHAR(255),
        expense_id INT,
        FOREIGN KEY (borrower_email) REFERENCES user(email) ON DELETE CASCADE,
        FOREIGN KEY (expense_id) REFERENCES expense(expense_id) ON DELETE CASCADE
    )
`

const insert_into_splits = () => {
    return `
        INSERT INTO split (split_amount, borrower_email, expense_id)
        VALUES ?
    `
}

export { split_table, insert_into_splits }