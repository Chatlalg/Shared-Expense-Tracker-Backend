const user_table = `
    CREATE TABLE IF NOT EXISTS user(
        email VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) 
    )
`

const insert_into_user = (email,username) => {
    return `
        INSERT INTO user VALUES
        ('${email}', '${username}')
    `
}

export {user_table, insert_into_user}