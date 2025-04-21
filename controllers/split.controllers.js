import connection_instance from "../db/connection_instance.js"
import { insert_into_payment } from "../tables/payment.tables.js"
import { update_settlements, delete_settlement } from "../tables/settlement.tables.js"

const handle_get_settlements = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id, user_email } = req.body
    

    const borrower_query = `
        SELECT u.username, s.outstanding_amount, s.lender_email
        FROM settlement as s
        JOIN user as u ON s.lender_email = u.email
        WHERE s.pool_id = '${pool_id}' AND s.borrower_email = '${user_email}'
    `
    
    const lender_query = `
        SELECT u.username, s.outstanding_amount, s.borrower_email
        FROM settlement as s
        JOIN user as u ON s.borrower_email = u.email
        WHERE s.pool_id = '${pool_id}' AND s.lender_email = '${user_email}'
    `

    connection.query(borrower_query, (err1, borrower_results) => {
        if (err1) return next(err1)
        
        connection.query(lender_query, (err2, lender_results) => {
            if (err2) return next(err2)
            
            res.status(200).json({
                borrowings: borrower_results.map(result => ({
                    username: result.username,
                    amount: result.outstanding_amount,
                    email: result.lender_email,
                    userIsBorrower: true
                })),
                lendings: lender_results.map(result => ({
                    username: result.username,
                    amount: result.outstanding_amount,
                    email: result.borrower_email,
                    userIsBorrower: false
                }))
            })
        })
    })
}

const handle_make_payment = async (req, res, next) => {
    const connection = connection_instance()
    const { pool_id, borrower_email, lender_email, amount } = req.body
    
    console.log('Payment request received:', { pool_id, borrower_email, lender_email, amount });
    
    // Validate and convert inputs
    const poolIdNum = parseInt(pool_id);
    const amountNum = parseFloat(amount);

    if (isNaN(poolIdNum) || isNaN(amountNum) || !borrower_email || !lender_email) {
        return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    if (amountNum <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // First, let's check the settlements table directly to debug
    connection.query(
        'SELECT * FROM settlement WHERE pool_id = ?',
        [poolIdNum],
        (err, allSettlements) => {
            if (err) {
                console.error("Error checking all settlements:", err);
                return res.status(500).json({ message: "Failed to check settlements" });
            }
            
            console.log('All settlements for pool:', allSettlements);
            
            // Now proceed with the transaction
            connection.beginTransaction((err) => {
                if (err) {
                    console.error("Transaction error:", err);
                    return res.status(500).json({ message: "Failed to start transaction" });
                }

                // Check if settlement exists in either direction
                connection.query(`
                    SELECT outstanding_amount, lender_email, borrower_email 
                    FROM settlement 
                    WHERE pool_id = ? AND (
                        (lender_email = ? AND borrower_email = ?)
                        OR
                        (lender_email = ? AND borrower_email = ?)
                    )
                `, [poolIdNum, lender_email, borrower_email, borrower_email, lender_email], (err1, results) => {
                    if (err1) {
                        console.error("Settlement check error:", err1);
                        return connection.rollback(() => res.status(500).json({ message: "Failed to check settlement" }));
                    }

                    console.log('Settlement check results:', {
                        poolId: poolIdNum,
                        lender: lender_email,
                        borrower: borrower_email,
                        results: results
                    });

                    if (results.length === 0) {
                        return connection.rollback(() => res.status(400).json({ 
                            message: "No settlement found. Please verify the payment details.",
                            debug: {
                                poolId: poolIdNum,
                                lender: lender_email,
                                borrower: borrower_email
                            }
                        }));
                    }

                    const settlement = results[0];
                    const isReversed = settlement.lender_email === borrower_email && settlement.borrower_email === lender_email;
                    const outstanding_amount = parseFloat(settlement.outstanding_amount);

                    if (amountNum > outstanding_amount) {
                        return connection.rollback(() => res.status(400).json({ 
                            message: `Payment amount (${amountNum}) cannot exceed outstanding amount (${outstanding_amount})`
                        }));
                    }

                    // Insert payment record with correct direction
                    const actualLenderEmail = isReversed ? borrower_email : lender_email;
                    const actualBorrowerEmail = isReversed ? lender_email : borrower_email;

                    connection.query(insert_into_payment(), [poolIdNum, actualLenderEmail, actualBorrowerEmail, amountNum], (err2) => {
                        if (err2) {
                            console.error("Payment insert error:", err2);
                            return connection.rollback(() => res.status(500).json({ message: "Failed to record payment" }));
                        }

                        const remaining_amount = outstanding_amount - amountNum;

                        if (remaining_amount > 0) {
                            // Update remaining amount
                            connection.query(update_settlements(), 
                                [remaining_amount, poolIdNum, settlement.lender_email, settlement.borrower_email],
                                (err3) => {
                                    if (err3) {
                                        console.error("Update settlement error:", err3);
                                        return connection.rollback(() => res.status(500).json({ message: "Failed to update settlement" }));
                                    }
                                    connection.commit((err4) => {
                                        if (err4) {
                                            console.error("Commit error:", err4);
                                            return res.status(500).json({ message: "Failed to commit transaction" });
                                        }
                                        res.status(200).json({ message: "Partial payment successful" });
                                    });
                                });
                        } else {
                            // Delete settlement record as debt is cleared
                            connection.query(delete_settlement(), 
                                [poolIdNum, settlement.lender_email, settlement.borrower_email],
                                (err3) => {
                                    if (err3) {
                                        console.error("Delete settlement error:", err3);
                                        return connection.rollback(() => res.status(500).json({ message: "Failed to delete settlement" }));
                                    }
                                    connection.commit((err4) => {
                                        if (err4) {
                                            console.error("Commit error:", err4);
                                            return res.status(500).json({ message: "Failed to commit transaction" });
                                        }
                                        res.status(200).json({ message: "Full payment successful" });
                                    });
                                });
                        }
                    });
                });
            });
        }
    );
}

export { handle_get_settlements, handle_make_payment } 