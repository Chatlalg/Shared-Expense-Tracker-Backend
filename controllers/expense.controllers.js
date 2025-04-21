import connection_instance from "../db/connection_instance.js"
import { get_all_expenses, get_total_expense, insert_into_expense, get_expense_borrowers } from "../tables/expense.tables.js"
import { insert_into_settlement, delete_settlement, update_settlements, check_reverse_settlement } from "../tables/settlement.tables.js"
import { insert_into_splits } from "../tables/split.tables.js"

/**
 * 
 * @param {Request} req - request object 
 * @param {Response} res - response object
 * @param {Function} next - middleware function
 * @returns {Array.<{username, email, expense_id, amount, description, pool_id, creation_date}>}
 */
const handle_get_all_expenses = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id } = req.body
    connection.query(get_all_expenses(pool_id), (err, results) => {
        if (err) return next(err)
        res.status(200).json(results)
    })
}

const handle_get_total_expense = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id } = req.body
    connection.query(get_total_expense(pool_id), (err, results) => {
        if (err) return next(err)
        console.log(results)
        res.status(200).json({
            total_expense: results[0].total_expense
        })
    })
}

const handle_add_expense = async (req, res, next) => {
    const connection = connection_instance()
    const { amount, description, lender_email, pool_id, splitType, participants, participantAmounts } = req.body
    
    // Input validation
    if (!amount || !description || !lender_email || !pool_id || !splitType) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (splitType === 'equal' && (!participants || participants.length === 0)) {
        return res.status(400).json({ message: "No participants selected for equal split" });
    }

    if (splitType === 'unequal' && (!participantAmounts || participantAmounts.length === 0)) {
        return res.status(400).json({ message: "No amounts specified for unequal split" });
    }

    console.log('Adding expense with:', { amount, description, lender_email, pool_id, splitType, participants, participantAmounts });
    
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({ message: "Failed to start transaction" });
        }
        
        const creation_date = new Date().toISOString().slice(0, 10)

        connection.query(insert_into_expense(lender_email, amount, description, pool_id, creation_date), (err2, results) => {
            if (err2) {
                console.error("Expense insert error:", err2);
                return connection.rollback(() => res.status(500).json({ message: "Failed to add expense" }));
            }
            
            const expense_id = results.insertId

            let splits = []
            if (splitType === 'equal') {
                const share = amount / participants.length
                splits = participants
                    .filter(email => email !== lender_email)
                    .map((email) => ({ email, share }))
            } else {
                splits = participantAmounts
                    .filter(({ email }) => email !== lender_email)
                    .map(({ email, amount }) => ({
                        email,
                        share: amount
                    }))
            }

            if (splits.length === 0) {
                return connection.rollback(() => res.status(400).json({ message: "No valid participants found" }));
            }

            const splitValues = splits.map(split => [split.share, split.email, expense_id])
            connection.query(insert_into_splits(), [splitValues], (err3) => {
                if (err3) {
                    console.error("Split insert error:", err3);
                    return connection.rollback(() => res.status(500).json({ message: "Failed to add splits" }));
                }

                const upserts = splits.map(split => {
                    return new Promise((resolve, reject) => {
                        connection.query(check_reverse_settlement(), [pool_id, split.email, lender_email], (err4, results) => {
                            if (err4) {
                                console.error("Reverse settlement check error:", err4);
                                reject(err4);
                                return;
                            }
                            
                            if (results.length > 0) {
                                const reverseAmount = results[0].outstanding_amount;
                                const splitAmount = parseFloat(split.share);
                                if (reverseAmount > splitAmount) {
                                    connection.query(update_settlements(),
                                        [reverseAmount - splitAmount, pool_id, split.email, lender_email],
                                        (err5) => {
                                            if (err5) {
                                                console.error("Update settlement error:", err5);
                                                reject(err5);
                                                return;
                                            }
                                            resolve();
                                        });
                                } else {
                                    connection.query(delete_settlement(),
                                        [pool_id, split.email, lender_email],
                                        (err5) => {
                                            if (err5) {
                                                console.error("Delete settlement error:", err5);
                                                reject(err5);
                                                return;
                                            }
                                            connection.query(insert_into_settlement(),
                                                [pool_id, split.email, lender_email, splitAmount - reverseAmount],
                                                (err6) => {
                                                    if (err6) {
                                                        console.error("Insert settlement error:", err6);
                                                        reject(err6);
                                                        return;
                                                    }
                                                    resolve();
                                                });
                                        });
                                }
                            } else {
                                connection.query(insert_into_settlement(),
                                    [pool_id, split.email, lender_email, split.share],
                                    (err5) => {
                                        if (err5) {
                                            console.error("Insert settlement error:", err5);
                                            reject(err5);
                                            return;
                                        }
                                        resolve();
                                    });
                            }
                        });
                    });
                });

                Promise.all(upserts)
                    .then(() => {
                        connection.commit((err6) => {
                            if (err6) {
                                console.error("Commit error:", err6);
                                return connection.rollback(() => res.status(500).json({ message: "Failed to commit transaction" }));
                            }
                            res.status(201).json({ 
                                message: "Expense added successfully",
                                expense_id 
                            });
                        });
                    })
                    .catch(error => {
                        console.error("Upsert error:", error);
                        connection.rollback(() => res.status(500).json({ message: "Failed to process settlements" }));
                    });
            });
        });
    });
}

const handle_get_expense_borrowers = async (req, res, next) => {
    const connection = connection_instance()
    const { expense_id } = req.body
    
    connection.query(get_expense_borrowers(expense_id), (err, results) => {
        if (err) return next(err)
        res.status(200).json(results)
    })
}

export { handle_get_all_expenses, handle_get_total_expense, handle_add_expense, handle_get_expense_borrowers }