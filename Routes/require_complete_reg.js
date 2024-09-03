const dbConfig = require("./dbConfig");
const oracledb = require("oracledb");

const require_complete_reg = async (req, res, next) => {
    console.log(req.session.email);
    const id=req.session.USER_ID;
    const user_email = req.session.email;
    let connection;
    try {
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
            res.render('vendor_ejs/edit_profile', { vendordata });
        } else {
            next();
        }
        
    } catch (error) {
        console.log(error);
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
