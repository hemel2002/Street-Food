-- Drop the existing VENDORS table if it exists (optional, only if needed)
DROP TABLE VENDORS;

-- Create sequence for V_ID
CREATE SEQUENCE VENDORS_SEQ
  START WITH 1
  INCREMENT BY 1
  NOMAXVALUE;

-- Create table VENDORS
CREATE TABLE VENDORS (
    V_ID VARCHAR2(100) PRIMARY KEY,
    V_FIRST_NAME VARCHAR2(50) NOT NULL,
    V_LAST_NAME VARCHAR2(50) NOT NULL,
    EMAIL VARCHAR2(100) NOT NULL,
    PHONE VARCHAR2(20) NOT NULL,
    STALL_NAME VARCHAR2(100) NOT NULL,
    DISTRICT VARCHAR2(50) NOT NULL,
    AREA VARCHAR2(200),
    CITY VARCHAR2(50) NOT NULL,
    STALL_PIC VARCHAR2(255) NOT NULL,
    LOCATION_URL VARCHAR2(255) NOT NULL,
    PASSWORD VARCHAR2(300) NOT NULL
);

-- Create trigger to auto-populate V_ID
CREATE OR REPLACE TRIGGER VENDORS_BEFORE_INSERT BEFORE
    INSERT ON VENDORS FOR EACH ROW
BEGIN
    :NEW.V_ID := 'S_'
                 || VENDORS_SEQ.NEXTVAL;
END;
/

------------------------------------insert data------------------------------------
INSERT INTO VENDORS (
    ACCOUNT_TYPE,
    V_FIRST_NAME,
    V_LAST_NAME,
    EMAIL,
    PHONE,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERMS,
    STALL_PIC,
    STALL_NAME,
    LOCATION_URL
) VALUES (
    'Seller',
    'Carol',
    'White',
    'carol.white@business.com',
    '333-444-5555',
    'South District',
    'Hilltown',
    'Business Park',
    'encrypted_password5',
    'i am user',
    NULL,
    NULL,
    NULL
);

INSERT INTO VENDORS (
    ACCOUNT_TYPE,
    V_FIRST_NAME,
    V_LAST_NAME,
    EMAIL,
    PHONE,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERMS,
    STALL_PIC,
    STALL_NAME,
    LOCATION_URL
) VALUES (
    'Seller',
    'fahim',
    'fahim',
    'fahim1288@gmail.com',
    '01790159919',
    'dhaka',
    'Dhaka cantonment',
    '17/3 west matikata, Dhaka - 1206, Bangladesh',
    '1111',
    'on',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719749049/food/bxazddnypupfto0onl2t.jpg',
    'GHHGHBGD',
    'https://www.google.com/maps/@23.82351,90.3926415,16z?entry=ttu'
);

INSERT INTO VENDORS (
    ACCOUNT_TYPE,
    V_FIRST_NAME,
    V_LAST_NAME,
    EMAIL,
    PHONE,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERMS,
    STALL_PIC,
    STALL_NAME,
    LOCATION_URL
) VALUES (
    'Seller',
    'fahim',
    'fahim',
    'fahim1269@gmail.com',
    '01790159919',
    'dhaka',
    'Dhaka cantonment',
    '01 West Matikata Road, Dhaka - 1206, Bangladesh',
    '1234',
    'on',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719847684/food/j6wrfc3ewgvmx2uyzh4q.jpg',
    'GHHGHBGD',
    'https://www.google.com/maps/@23.82351,90.3926415,16z?entry=ttu'
);

INSERT INTO VENDORS (
    ACCOUNT_TYPE,
    V_FIRST_NAME,
    V_LAST_NAME,
    EMAIL,
    PHONE,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERMS,
    STALL_PIC,
    STALL_NAME,
    LOCATION_URL
) VALUES (
    'Seller',
    'fahim',
    'fahim',
    'nahidur@gmail.com',
    '01790159919',
    'dhaka',
    'Dhaka cantonment',
    'Kalshi, Mirpur 11, Dhaka - 1206, Bangladesh',
    '123456',
    'on',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1720500090/food/zen9qvlk4sqpgltlihnm.png',
    'gorib',
    'https://www.google.com/maps/@23.82351,90.3926415,16z?entry=ttu'
);

INSERT INTO VENDORS (
    ACCOUNT_TYPE,
    V_FIRST_NAME,
    V_LAST_NAME,
    EMAIL,
    PHONE,
    DISTRICT,
    CITY,
    AREA,
    PASSWORD,
    TERMS,
    STALL_PIC,
    STALL_NAME,
    LOCATION_URL
) VALUES (
    'Seller',
    'fahim',
    'SRGSDFV S',
    'dsfd@gmail.com',
    '01790159919',
    'dhaka',
    'Dhaka cantonment',
    'Skylark Model School, 01 Matikata Bazar Road, Matikata, Dhaka - 1206, Bangladesh',
    '1234',
    'on',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1720513186/food/eutji2obdnbmjqz29pbu.png',
    'khan pina',
    'https://www.google.com/maps/@23.82351,90.3926415,16z?entry=ttu'
);