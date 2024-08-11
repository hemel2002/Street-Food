CREATE OR REPLACE TYPE COMPLAINTS AS
    OBJECT (
        C_COMPLAINT_DATE TIMESTAMP(6),
        COMPLAINT VARCHAR2(4000),
        MESSAGE VARCHAR2(4000),
        SUBJECT VARCHAR2(4000),
        A_REPLY_DATE TIMESTAMP(6),
        STATUS VARCHAR2(20) -- Remove the DEFAULT clause
    );
    DROP TYPE COMPLAINTS FORCE;
 
    -- Add a new column to the CUSTOMERREVIEWSVENDOR
    ALTER TABLE CUSTOMERREVIEWSVENDOR
        ADD COMPLAINT_DETAILS COMPLAINTS;
 
        -- ///////////////////////////////////////////////////////////
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:18:36.848',
            'Vendor was rude and unprofessional.',
            NULL,
            'Poor Service',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_17';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:26:38.79',
            'Food packaging was not hygienic.',
            NULL,
            'Poor decoration',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_21';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        ) WHERE C_ID = 'U_11' AND V_ID = 'S_17';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        ) WHERE C_ID = 'U_11' AND V_ID = 'S_21';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        ) WHERE C_ID = 'U_10' AND V_ID = 'S_16';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        ) WHERE C_ID = 'U_7' AND V_ID = 'S_11';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:10:20.092',
            'Received incorrect order and was overcharged.',
            NULL,
            'Poor Service',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_9' AND V_ID = 'S_17';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:36:23.091',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_16';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:39:13.595',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_22';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:41:15.938',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_11';
        UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:45:00.528',
            'Received food with missing items.',
            NULL,
            'missing item',
            NULL,
            'Pending'
        ) WHERE C_ID = 'U_8' AND V_ID = 'S_13';
 
        -- ///////////////////////////////////////////////////////////
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:18:36.848',
            'Vendor was rude and unprofessional.',
            NULL,
            'Poor Service',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_17';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:26:38.79',
            'Food packaging was not hygienic.',
            NULL,
            'Poor decoration',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_21';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        )
    WHERE
        C_ID = 'U_11'
        AND V_ID = 'S_17';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        )
    WHERE
        C_ID = 'U_11'
        AND V_ID = 'S_21';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        )
    WHERE
        C_ID = 'U_10'
        AND V_ID = 'S_16';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        )
    WHERE
        C_ID = 'U_7'
        AND V_ID = 'S_11';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:10:20.092',
            'Received incorrect order and was overcharged.',
            NULL,
            'Poor Service',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_9'
        AND V_ID = 'S_17';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:36:23.091',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_16';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:39:13.595',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_22';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:41:15.938',
            'Delivery was delayed by more than an hour.',
            NULL,
            'too much delay',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_11';
    UPDATE CUSTOMERREVIEWSVENDOR
    SET
        COMPLAINT_DETAILS = COMPLAINTS(
            TIMESTAMP '2024-08-07 03:45:00.528',
            'Received food with missing items.',
            NULL,
            'missing item',
            NULL,
            'Pending'
        )
    WHERE
        C_ID = 'U_8'
        AND V_ID = 'S_13';