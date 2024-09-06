const dbConfig = require("./dbConfig");
const oracledb = require("oracledb");
const e = require('connect-flash');
const require_complete_reg = async (req, res, next) => {
    console.log("Session object:", req.session);
    console.log("User email:", req.session.email);
    
    const user_email = req.session.email;
    let connection;
    try {
        const id = req.params.id;
        if (!id) {
            console.log("USER_ID is undefined");
            return res.status(400).send("USER_ID is not set in session");
        }
        
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT 
shop_data
            FROM VENDORS  
            WHERE email = :email`,
            [user_email]
        );
     
        const vendordata = result.rows[0];
        console.log(vendordata);
        if (vendordata && vendordata.SHOP_DATA === null) {

            res.redirect(`/vendor/${id}/edit_profile`);
        } else {
            next();
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.log(err);
            }
        }
    }
};

module.exports = require_complete_reg;