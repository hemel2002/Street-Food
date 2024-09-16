const dbConfig = require("./dbConfig");
const oracledb = require("oracledb");

const warning = async (req, res, next) => {
    const user_email = req.session.email;
    const id = req.params.id;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Fetch any complaint or restriction message
        const result2 = await connection.execute(
            `SELECT c.complaint_details.message AS message 
             FROM customerreviewsvendor c 
             WHERE V_id = :id`, 
            [id]
        );
        const action = result2.rows;

        if (action.length > 0 && action[0].MESSAGE === 'restrict_food_creation Max 4 posts/day') {
            // If restriction exists, get the restriction dates
            const result3 = await connection.execute(
                `SELECT restriction_start_date AS start_date, 
                        restriction_end_date AS end_date 
                 FROM vendors 
                 WHERE V_id = :id`,
                [id]
            );

            if (result3.rows.length > 0) {
                const start_date = new Date(result3.rows[0].START_DATE);
                const end_date = new Date(result3.rows[0].END_DATE);
                const current_date = new Date();

                // Check if the current date falls within the restriction period
                if (current_date >= start_date && current_date <= end_date) {
                    // Count how many foods the vendor has posted today
                    const result4 = await connection.execute(
                        `SELECT COUNT(*) AS post_count 
                         FROM food f,vendor_sells_food v  
                         WHERE v.V_id = :id and f.Food_id = v.Food_id
                         AND TRUNC(f.create_date) = TRUNC(SYSDATE)`,  // Check only today's posts
                        [id]
                    );

                    const post_count = result4.rows[0].POST_COUNT;

                    // If the vendor has posted 4 or more foods today, restrict them
                    if (post_count >= 4) {
                        req.flash('error', 'You have reached the limit of 4 food posts per day.');
                        return res.redirect(`/vendor/${id}`);  // Redirect vendor with a warning
                    }
                }
            }
        }
        else if (action.length > 0 && action[0].MESSAGE === 'restrict_food_creation Max 2 posts/day') {
          // If restriction exists, get the restriction dates
          const result3 = await connection.execute(
            `SELECT restriction_start_date AS start_date, 
                    restriction_end_date AS end_date 
             FROM vendors
             WHERE V_id = :id`,
            [id]
        );

        if (result3.rows.length > 0) {
            const start_date = new Date(result3.rows[0].START_DATE);
            const end_date = new Date(result3.rows[0].END_DATE);
            const current_date = new Date();

            // Check if the current date falls within the restriction period
            if (current_date >= start_date && current_date <= end_date) {
                // Count how many foods the vendor has posted today
                const result4 = await connection.execute(
                    `SELECT COUNT(*) AS post_count 
                     FROM food f,vendor_sells_food v  
                     WHERE v.V_id = :id and f.Food_id = v.Food_id
                     AND TRUNC(f.create_date) = TRUNC(SYSDATE)`,  // Check only today's posts
                    [id]
                );

                const post_count = result4.rows[0].POST_COUNT;

                // If the vendor has posted 4 or more foods today, restrict them
                if (post_count >= 2) {
                    req.flash('error', 'You have reached the limit of 2 food posts per day.');
                    return res.redirect(`/vendor/${id}`);   // Redirect vendor with a warning
                }
            }
        }
        }
       

        // Continue with the next middleware or action if no restrictions apply
        next();
    } catch (err) {
        console.error(err);
        next(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
                next(err);
            }
        }
    }
};

module.exports = warning;