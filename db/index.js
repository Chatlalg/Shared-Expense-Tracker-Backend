import connection_instance from "./connection_instance.js";
import { user_table } from "../tables/user.tables.js";
import { createTable } from "../utils/create-table.js";
import { pool_table } from "../tables/pool.tables.js";
import { pool_members_table } from "../tables/pool_members.tables.js";
import { expense_table } from "../tables/expense.tables.js";
import { split_table } from "../tables/split.tables.js";
import { settlement_table } from "../tables/settlement.tables.js";
import { payment_table } from "../tables/payment.tables.js";

const connectDB = () => {
    const connection = connection_instance()
    connection.connect((err) => {
        if (err) throw new Error(err.message, "in index.js")
        console.log("Successfully connected to DB")
        createTable(user_table)
        createTable(pool_table)
        createTable(pool_members_table)
        createTable(expense_table)
        createTable(split_table)
        createTable(settlement_table)
        createTable(payment_table)
    })
}

export { connectDB }