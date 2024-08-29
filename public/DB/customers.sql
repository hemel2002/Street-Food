-- Table creation
CREATE TABLE "SYSTEM"."CUSTOMERS" (
    "C_ID" VARCHAR2(100) NOT NULL ENABLE,
    "PHONE" VARCHAR2(20),
    "EMAIL" VARCHAR2(100),
    "ACCOUNT_TYPE" VARCHAR2(50) NOT NULL ENABLE,
    "FIRST_NAME" VARCHAR2(100),
    "LAST_NAME" VARCHAR2(100),
    "DISTRICT" VARCHAR2(100),
    "CITY" VARCHAR2(100),
    "AREA" VARCHAR2(100),
    "PASSWORD" VARCHAR2(300),
    "TERM" VARCHAR2(10),
    "JOIN_DATE" TIMESTAMP (6) DEFAULT SYSTIMESTAMP,
    CONSTRAINT "PK_NEW_CUSTOMERS" PRIMARY KEY ("C_ID") USING INDEX ENABLE
);

-- Sequence creation
CREATE SEQUENCE CUSTOMERS_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE;

-- Trigger creation
CREATE OR REPLACE TRIGGER CUSTOMERS_BEFORE_INSERT BEFORE
    INSERT ON CUSTOMERS FOR EACH ROW
BEGIN
    :NEW.C_ID := 'U_'
                 || TO_CHAR(CUSTOMERS_SEQ.NEXTVAL);
END;
/

---------------------------------------insert data-------------------------------------------


INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'fahim@gmail.com',
    'User',
    'fahim',
    'fahim',
    'dhaka',
    'Dhaka cantonment',
    '17/3 west matikata, Dhaka - 1206, Bangladesh',
    '1234',
    'on'
);

INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'fahim12@gmail.com',
    'User',
    'fahim',
    'fahim',
    'dhaka',
    'Dhaka cantonment',
    '01 West Matikata Road, Dhaka - 1206, Bangladesh',
    '1234',
    'on'
);

INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'nahidur@gmail.com',
    'User',
    'fahim',
    'fahim',
    'dhaka',
    'Dhaka cantonment',
    'Kalshi, Mirpur 11, Dhaka - 1206, Bangladesh',
    '123456',
    'on'
);

INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'nahid123@gmail.com',
    'User',
    'gfhft',
    'hfd',
    'dhaka',
    'Dhaka cantonment',
    'Mirpur Khas Taluka, SD, Pakistan',
    '11',
    'on'
);

INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'shahriar12688@gmail.com',
    'User',
    'fahim',
    'fahim',
    'dhaka',
    'Dhaka cantonment',
    '17/3 west matikata, Dhaka - 1206, Bangladesh',
    '1234',
    'on'
);

INSERT INTO CUSTOMERS (
    PHONE,
    EMAIL,
    ACCOUNT_TYPE,
    FIRST_NAME,
    LAST_NAME,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERM
) VALUES (
    '01790159919',
    'vesselknight2462@gmail.com',
    'User',
    'fahim',
    'fahim',
    'dhaka',
    'Dhaka cantonment',
    '17/3 west matikata, Dhaka - 1206, Bangladesh',
    '1234',
    'on'
);