import connection_instance from "../db/connection_instance.js"
import { get_all_expenses, get_total_expense, insert_into_expense } from "../tables/expense.tables.js"
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
    console.log(participants)
    connection.beginTransaction((err) => {
        if (err) return next(err)
        const creation_date = new Date().toISOString().slice(0, 10)

        connection.query(insert_into_expense(lender_email, amount, description, pool_id, creation_date), (err2, results) => {
            if (err2) return connection.rollback(() => next(err2))
            const expense_id = results.insertId

            let splits = []
            if (splitType === 'equal') {
                const share = amount / participants.length
                splits = participants.map((email) => ({ email, share }))
            } else {
                splits = participantAmounts.map(({ email, amount }) => ({
                    email,
                    share: amount
                }))
            }

            const splitValues = splits.map(split => [split.share, split.email, expense_id])
            connection.query(insert_into_splits(), [splitValues], (err3) => {
                if (err3) return connection.rollback(() => next(err3))

                const upserts = splits.map(split => {
                    return new Promise((resolve, reject) => {
                        connection.query(check_reverse_settlement(), [pool_id, split.email, lender_email], (err4, results) => {
                            if (err4) reject(err4);
                            if (results.length > 0) {
                                const reverseAmount = results[0].outstanding_amount;
                                const splitAmount = parseFloat(split.share);
                                if (reverseAmount > splitAmount) {
                                    connection.query(update_settlements(),
                                        [reverseAmount - splitAmount, pool_id, split.email, lender_email],
                                        (err5) => {
                                            if (err5) reject(err5);
                                            resolve();
                                        });
                                } else if (reverseAmount < splitAmount) {
                                    connection.query(delete_settlement(),
                                        [pool_id, split.email, lender_email],
                                        (err5) => {
                                            if (err5) reject(err5);
                                            connection.query(insert_into_settlement(),
                                                [pool_id, split.email, lender_email, splitAmount - reverseAmount],
                                                (err6) => {
                                                    if (err6) reject(err6);
                                                    resolve();
                                                });
                                        });
                                } else {
                                    connection.query(delete_settlement(),
                                        [pool_id, split.email, lender_email],
                                        (err5) => {
                                            if (err5) reject(err5);
                                            resolve();
                                        });
                                }
                            } else {
                                connection.query(insert_into_settlement(),
                                    [pool_id, split.email, lender_email, split.share],
                                    (err5) => {
                                        if (err5) reject(err5);
                                        resolve();
                                    });
                            }
                        });
                    });
                });

                Promise.all(upserts)
                    .then(() => {
                        connection.commit((err6) => {
                            if (err6) return connection.rollback(() => next(err6))
                            res.status(201).json({ expense_id })
                        })
                    })
                    .catch(error => connection.rollback(() => next(error)))

            })
        })
    })
}

export { handle_get_all_expenses, handle_get_total_expense, handle_add_expense }