CREATE OR REPLACE TYPE SHOP_INFO_TYPE AS
    OBJECT (
        STALL_NAME VARCHAR2(100),
        V_FIRST_NAME VARCHAR2(50),
        V_LAST_NAME VARCHAR2(50),
        AREA VARCHAR2(200),
        CITY VARCHAR2(50),
        DISTRICT VARCHAR2(50),
        STALL_TITLE VARCHAR2(1000),
        STALL_PIC VARCHAR2(255),
        LOCATION_URL VARCHAR2(255),
        STATUS VARCHAR2(10), -- Removed DEFAULT 'open'
        SHOP_DESCRIPTION VARCHAR2(4000),
        Working_Hours VARCHAR2(100),
        hygiene_rating NUMBER(2, 1),
        Qr_code VARCHAR2(255)

    );
 drop type SHOP_INFO_TYPE;



ALTER TABLE vendors ADD (Shop_data shop_info_type);

