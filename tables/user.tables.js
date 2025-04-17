const user_table = `
    CREATE TABLE IF NOT EXISTS user(
        email VARCHAR(255) PRIMARY KEY 
    )
`

const insert_into_user = (email) => {
    return `
        INSERT INTO user VALUES
        ('${email}')
    `
}

export {user_table, insert_into_user}