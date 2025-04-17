const pool_table = `
    CREATE TABLE IF NOT EXISTS pool(
        group_id INT PRIMARY KEY AUTO_INCREMENT,
        creation_date DATE NOT NULL
    )
`

export default pool_table