const pool_members_table = `
    CREATE TABLE IF NOT EXISTS pool_members(
        is_group_admin BOOL NOT NULL,
        email VARCHAR(255),
        group_id INT,
        FOREIGN KEY (email) REFERENCES user(email) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES pool(group_id) ON DELETE CASCADE
    )
`

export default pool_members_table