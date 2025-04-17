import connection_instance from "../db/connection_instance.js"
export const createTable = (definition) => {
    const connection = connection_instance()
    connection.query(definition,(err,results)=>{
        if(err) throw new Error(`Creating Table: ${err.message}`) 
    })
}