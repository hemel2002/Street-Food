
const dbConfig = require("../Routes/dbConfig");
const oracledb = require("oracledb");


const require_complete_reg =async (req, res, next) => {
    console.log(req.session.user_email);
    const user_email = req.session.user_email;
    let connection ;
    try {
        connection = await connection.getConnection(dbConfig);
       const result= connection.execute(
            "SELECT s.shop_data.SATLL_NAME AS Stall_name,s.shop_data.v_first_name as v_first_name,s.shop_data.v_last_name as v_last_name,s.shop_data.area as area,s.shop_data.city as city,s.shop_data.district as district,s.shop_data.stall_title as stall_title,s.shop_data.stall_pic as stall_pic,s.shop_data.location_url as location_url, s.shop_data.status as status,s.shop_data.shop_description as shop_description FROM users WHERE email = :email",
            [user_email],

        );
    const vendor=result.rows[0];
    if(vendor){
        next();
    }
    else{
        res.redirect(`/vendor/${id}/edit_profile`);
    }
        } catch (error) {
            console.log(error);
        }finally{
            if(connection){
                try{
                    await connection.close();
                }catch(err){
                    console.log(err);
                }
            }
        }



   
  };
  module.exports = require_complete_reg;
  