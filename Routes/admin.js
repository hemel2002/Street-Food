const express = require('express');
const router = express.Router();

const { requireloginadmin } = require('./requirelogin_middleware');
const OracleDB = require('oracledb');
const dbConfig = require('./dbConfig');
const { v4: uuid } = require('uuid');
const { assign } = require('nodemailer/lib/shared');
let customersdata = [];
let vendorsdata = [];
//////////////////////////////////////////////ADMIN DASHBOARD//////////////////////////////////////////////
router.get('/:id', requireloginadmin, async (req, res) => {
  req.session.show_data = 0;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM customers ORDER BY join_date DESC`
    );
    const result2 = await connection.execute(
      `SELECT * FROM vendors ORDER BY join_date DESC`
    );
    const result3 = await connection.execute(
      `SELECT count(c_id) AS total_customers FROM customers`
    );
    const result4 = await connection.execute(
      `SELECT count(v_id) AS total_vendors FROM vendors`
    );
    const result5 = await connection.execute(
      `SELECT count(v_id) AS active_vendors FROM vendors WHERE active='yes'`
    );
    const result6 = await connection.execute(
      `
      SELECT
        C_ID,
        FIRST_NAME,
        EMAIL,
        PROFILE_PICTURE,
        EXTRACT(DAY FROM (SYSTIMESTAMP - JOIN_DATE)) AS DAYS,
        EXTRACT(HOUR FROM (SYSTIMESTAMP - JOIN_DATE)) AS HOURS,
        EXTRACT(MINUTE FROM (SYSTIMESTAMP - JOIN_DATE)) AS MINUTES,
        EXTRACT(SECOND FROM (SYSTIMESTAMP - JOIN_DATE)) AS SECONDS
      FROM
        customers
      ORDER BY
        JOIN_DATE DESC
      `
    );

    const result7 = await connection.execute(
      `
      SELECT
        v_ID,
        V.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME,
        EMAIL,PROFILE_PIC,
        EXTRACT(DAY FROM (SYSTIMESTAMP - JOIN_DATE)) AS DAYS,
        EXTRACT(HOUR FROM (SYSTIMESTAMP - JOIN_DATE)) AS HOURS,
        EXTRACT(MINUTE FROM (SYSTIMESTAMP - JOIN_DATE)) AS MINUTES,
        EXTRACT(SECOND FROM (SYSTIMESTAMP - JOIN_DATE)) AS SECONDS
      FROM
        vendors V
      ORDER BY
        JOIN_DATE DESC
      `
    );

    const result8 = await connection.execute(
      `SELECT GET_RECENT_VENDORS_COUNT() AS recent_vendors_count FROM DUAL`
    );
    const result9 = await connection.execute(
      `SELECT GET_RECENT_CUSTOMERS_COUNT() AS recent_customers_count FROM DUAL`
    );
    const result11 = await connection.execute(
      `SELECT COUNT("FOOD_ID") AS "TOTAL_FOOD" FROM "FOOD" WHERE "CATEGORY" = 'Dessert'`
    );
    const Dessert=result11.rows[0].TOTAL_FOOD||0;

       const result12 = await connection.execute(
      `SELECT COUNT("FOOD_ID") AS "TOTAL_FOOD" FROM "FOOD" WHERE "CATEGORY" = 'Others'`
    );
    const Others=result12.rows[0].TOTAL_FOOD||0;
    const result13 = await connection.execute(
      `SELECT COUNT("FOOD_ID") AS "TOTAL_FOOD" FROM "FOOD" WHERE "CATEGORY" = 'Fast Food'`
    );
    const FastFood=result13.rows[0].TOTAL_FOOD||0;
    const result14 = await connection.execute(
      `SELECT COUNT("FOOD_ID") AS "TOTAL_FOOD" FROM "FOOD" WHERE "CATEGORY" = 'Beverage'`
    );
    const Beverage=result14.rows[0].TOTAL_FOOD||0;
   

    console.log('food cat',result11.rows);

    const recentVendorsCount = result8.rows[0].RECENT_VENDORS_COUNT;
    const recentCustomersCount = result9.rows[0].RECENT_CUSTOMERS_COUNT;
    // console.log(recentVendorsCount);
    // console.log(recentCustomersCount);
    const C_data = result6.rows;
    const v_data = result7.rows;

    customersdata = result.rows;
    vendorsdata = result2.rows;
    // console.log(C_data);
    ///////////////////pending_complaints count////////////////////////
    const result10 = await connection.execute(
      `SELECT COUNT(*) AS pending_complaints FROM CUSTOMERREVIEWSVENDOR C WHERE C.COMPLAINT_DETAILS.STATUS = 'Pending'`
    );
    const pending_complaints = result10.rows[0].PENDING_COMPLAINTS;
    // console.log('pending_complaints: ', pending_complaints);
    req.session.pending_complaints = pending_complaints;

    res.render('Admin/Admin_Dashboard', {
      customersdata,
      vendorsdata,
      total_customers: result3.rows[0].TOTAL_CUSTOMERS,
      total_vendors: result4.rows[0].TOTAL_VENDORS,
      active_vendors: result5.rows[0].ACTIVE_VENDORS,
      C_data,
      v_data,
      recentVendorsCount,
      recentCustomersCount,
      pending_complaints,
      Dessert,
      Others,
      FastFood,
      Beverage
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

//////////////////////////////////////////////ADMIN VENDORS//////////////////////////////////////////////
router.get('/:id/admin_vendors', requireloginadmin, async (req, res) => {
  const sort = req.query.sort || 'C.COMPLAINT_DETAILS.C_COMPLAINT_DATE desc';
  let show_data;

  req.session.show_data = 3 + req.session.show_data;
  if (req.session.show_data > req.session.pending_complaints) {
    show_data = req.session.pending_complaints;
  } else {
    show_data = req.session.show_data;
  }

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT ROUND(avg(rating), 1) as avg_rating, v_id FROM customerreviewsvendor GROUP BY v_id`
    );
    const result1 = await connection.execute(
      `SELECT C.COMPLAINT_DETAILS as COMPLAINT_DETAILS ,C_ID,V_ID,C_EMAIL FROM customerreviewsvendor C where C.COMPLAINT_DETAILS.STATUS='Pending' order by ${sort}
      FETCH FIRST :show_data ROWS ONLY`,
      [show_data]
    );

    const customers_complaint_data = result1.rows;
    console.log(result.rows);
    avg_data = result.rows;
    res.render('Admin/Admin_Vendors', {
      vendorsdata,
      avg_data,
      customers_complaint_data,
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
//////////////////////////////////////////////ADMIN CUSTOMERS//////////////////////////////////////////////

router.get('/:id/admin_customers', requireloginadmin, async (req, res) => {
  const sort = req.query.sort || 'C.COMPLAINT_DETAILS.C_COMPLAINT_DATE desc';
  let show_data;

  req.session.show_data = 3 + req.session.show_data;
  if (req.session.show_data > req.session.pending_complaints) {
    show_data = req.session.pending_complaints;
  } else {
    show_data = req.session.show_data;
  }

  const response = req.query.response || 'null';
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT C.COMPLAINT_DETAILS as COMPLAINT_DETAILS ,C_ID,V_ID,C_EMAIL FROM customerreviewsvendor C where C.COMPLAINT_DETAILS.STATUS='Pending' order by ${sort}
      FETCH FIRST :show_data ROWS ONLY`,
      [show_data]
    );

    const customers_complaint_data = result.rows;

    console.log(customersdata);
    res.render('Admin/Admin_Customers', {
      customersdata,
      customers_complaint_data,
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
//////////////////////////////////////////////ADMIN COMPLAINTS//////////////////////////////////////////////

router.get(
  '/:id/admin_complaints_dashboard',
  requireloginadmin,
  async (req, res) => {
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        `SELECT C.COMPLAINT_DETAILS.C_COMPLAINT_DATE AS C_COMPLAINT_DATE, C_NAME, C_ID, V_ID, C_ID||V_ID AS COMPLAINT_ID,C.COMPLAINT_DETAILS.COMPLAINT AS COMPLAINT, C.COMPLAINT_DETAILS.SUBJECT AS SUBJECT, C.COMPLAINT_DETAILS.STATUS AS STATUS
         FROM customerreviewsvendor C 
         WHERE C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL 
         ORDER BY C.COMPLAINT_DETAILS.C_COMPLAINT_DATE DESC`
      );
      const result2 = await connection.execute(
        `SELECT count(c_id) AS total_complaints, C.v_id AS v_id
         FROM customerreviewsvendor C
         WHERE C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL
         GROUP BY v_id
         ORDER BY total_complaints DESC
         FETCH FIRST 3 ROWS ONLY`
      );
      const result3 = await connection.execute(
        `select count(C.COMPLAINT_DETAILS.status) as total_complaints from customerreviewsvendor C where C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL and C.COMPLAINT_DETAILS.status='Pending'`
      );
      const result4 = await connection.execute(
        `select count(C.COMPLAINT_DETAILS.status) as total_complaints from customerreviewsvendor C where C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL and C.COMPLAINT_DETAILS.status='Resolved'`
      );
      const result5 = await connection.execute(
        `select count(C.COMPLAINT_DETAILS.status) as total_complaints from customerreviewsvendor C where C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL and C.COMPLAINT_DETAILS.status='Dismissed'`
      );

      const pending_complaints = result3.rows[0].TOTAL_COMPLAINTS;
      const resolved_complaints = result4.rows[0].TOTAL_COMPLAINTS;
      const dismissed_complaints = result5.rows[0].TOTAL_COMPLAINTS;

      console.log('pending com',pending_complaints);
      console.log('resolved com',resolved_complaints);
      console.log('dismissed com',dismissed_complaints);

const complaint = result2.rows;


      const complaintsdata = result.rows;
      console.log(complaintsdata);

      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 6;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const displayedItems = complaintsdata.slice(startIndex, endIndex);
      const totalPages = Math.ceil(complaintsdata.length / itemsPerPage);

      res.render('Admin/Admin_Complaints_Dashboard', {
        complaintsdata,
        currentPage,
        totalPages,
        displayedItems,
        itemsPerPage,
        complaint,
        pending_complaints,
        resolved_complaints,
        dismissed_complaints,
        
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
);

//////////////////////////////////////////////ADMIN COMPLAINT DETAILS//////////////////////////////////////////////
router.get('/:id/complain_details', requireloginadmin, async (req, res) => {
  const { C_ID, V_ID } = req.query;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT C_ID||V_ID AS COMPLAINT_ID, C_EMAIL, C.COMPLAINT_DETAILS.C_COMPLAINT_DATE AS C_COMPLAINT_DATE, C_NAME, 
      C.COMPLAINT_DETAILS.COMPLAINT AS COMPLAINT, C.COMPLAINT_DETAILS.SUBJECT AS SUBJECT, 
      C.COMPLAINT_DETAILS.STATUS AS STATUS ,C.COMPLAINT_DETAILS.MESSAGE AS MESSAGE, C.COMPLAINT_DETAILS.A_REPLY_DATE AS A_REPLY_DATE
      FROM customerreviewsvendor C 
      WHERE C_ID=:C_ID AND V_ID=:V_ID AND C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL`,
      [C_ID, V_ID]
    );
    const result2 = await connection.execute(
      `SELECT C_ID||V_ID AS COMPLAINT_ID,C_ID,V_ID, C_EMAIL, C.COMPLAINT_DETAILS.C_COMPLAINT_DATE AS C_COMPLAINT_DATE, C_NAME, 
      C.COMPLAINT_DETAILS.COMPLAINT AS COMPLAINT, C.COMPLAINT_DETAILS.SUBJECT AS SUBJECT, 
      C.COMPLAINT_DETAILS.STATUS AS STATUS 
      FROM customerreviewsvendor C 
      WHERE C_ID !=:C_ID AND V_ID=:V_ID AND C.COMPLAINT_DETAILS.C_COMPLAINT_DATE IS NOT NULL`,
      [C_ID, V_ID]
    );

    const complaintsdata = result.rows[0]; // Fetch the first row of the result
    const prev_complaint = result2.rows;
    console.log(complaintsdata); // Log the data to verify its structure
    if (!complaintsdata) {
      // Handle case where no data is returned
      return res.status(404).send('No complaint found for the given ID.');
    }
    res.render('Admin/Admin_Complaint_details', {
      complaintsdata,
      prev_complaint,
      C_ID,
      V_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
//////////////////////////////////////////////ADMIN COMPLAINT RESOLVE//////////////////////////////////////////////
router.post('/:id/ComplaintAction', requireloginadmin, async (req, res) => {
  const { V_ID } = req.query;
  const { MESSAGE } = req.body;
  const STATUS = 'Resolved';
  const A_id=req.params.id;

  console.log(req.body);
  console.log(req.query.V_ID);

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM Vendors WHERE V_ID = :V_ID`,
      [V_ID]
    );
    console.log(result.rows);

    if (result.rows.length > 0) {
      const vendorData = result.rows[0]; // Get the first row of the result
      const SHOP_DATA = vendorData.SHOP_DATA;

      if (SHOP_DATA && SHOP_DATA.HYGIENE_RATING) {
        const HYGIENE_RATING = SHOP_DATA.HYGIENE_RATING - 0.5;
        console.log(HYGIENE_RATING);

        await connection.execute(
          `UPDATE customerreviewsvendor c
           SET c.COMPLAINT_DETAILS.STATUS = :STATUS,
               c.COMPLAINT_DETAILS.MESSAGE = :MESSAGE,
               c.COMPLAINT_DETAILS.A_REPLY_DATE = SYSTIMESTAMP
           WHERE V_ID = :V_ID`,
          {
            STATUS,
            MESSAGE,
            V_ID
          },
          { autoCommit: true }
        );

        await connection.execute(
          `UPDATE vendors V
           SET restriction_start_date = SYSDATE,
               restriction_end_date = SYSDATE + 2,
               V.shop_data.HYGIENE_RATING = :HYGIENE_RATING
           WHERE v_id = :V_ID`,
          [HYGIENE_RATING, V_ID],
          { autoCommit: true }
        );
      } else {
        console.error('SHOP_DATA or HYGIENE_RATING is missing');
        res.status(400).send('Invalid data');
        return;
      }
    } else {
      console.error('Vendor not found');
      res.status(404).send('Vendor not found');
      return;
    }

    res.redirect(`/admin/${A_id}/admin_complaints_dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
//////////////////////////////////////////////logout//////////////////////////////////////////////
router.post('/:id/logout', requireloginadmin, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});

module.exports = router;
