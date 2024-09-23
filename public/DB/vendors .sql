-- Drop the existing VENDORS table if it exists (optional, only if needed)
DROP TABLE VENDORS;

-- Create sequence for V_ID
CREATE SEQUENCE VENDORS_SEQ
  START WITH 1
  INCREMENT BY 1
  MAXVALUE 999999
  NOCACHE;


-- Create table VENDORS
CREATE TABLE "SYSTEM"."VENDORS" 
   (	"V_ID" VARCHAR2(50) NOT NULL ENABLE, 
	"EMAIL" VARCHAR2(100) NOT NULL ENABLE, 
	"PASSWORD" VARCHAR2(300) NOT NULL ENABLE, 
	"TERMS" VARCHAR2(10) NOT NULL ENABLE, 
	"ACCOUNT_TYPE" VARCHAR2(50), 
	"JOIN_DATE" TIMESTAMP (6) DEFAULT SYSTIMESTAMP, 
	"ACTIVE" VARCHAR2(3) DEFAULT 'yes', 
	"PHONE" VARCHAR2(20), 
	"PROFILE_PIC" VARCHAR2(700), 
	"SHOP_DATA" "SYSTEM"."SHOP_INFO_TYPE" , 
	"RESTRICTION_START_DATE" DATE DEFAULT NULL, 
	"RESTRICTION_END_DATE" DATE DEFAULT NULL, 
	"PERAMANENT_RESTRICTION" CHAR(1) DEFAULT 'N', 
	"DISPLAY_NAME" VARCHAR2(101) GENERATED ALWAYS AS ("SHOP_DATA"."V_FIRST_NAME"||' '||"SHOP_DATA"."V_LAST_NAME") VIRTUAL , 
	 CHECK (ACTIVE IN ('yes', 'no')) ENABLE, 
	 CONSTRAINT "VENDORS_PK" PRIMARY KEY ("V_ID")
  USING INDEX  ENABLE
   ) ;


-- Create trigger to auto-populate V_ID
CREATE OR REPLACE TRIGGER VENDORS_BEFORE_INSERT BEFORE
    INSERT ON VENDORS FOR EACH ROW
BEGIN
    :NEW.V_ID := 'S_'
                 || VENDORS_SEQ.NEXTVAL;
END;
/


ALTER TABLE VENDORS ADD Avg_rating NUMBER(3,2) DEFAULT 0 CHECK (Avg_rating BETWEEN 0 AND 5);
------------------------------------insert data------------------------------------
INSERT INTO VENDORS (
    ACCOUNT_TYPE,
  
    EMAIL,
    PHONE,
   
   
 
    PASSWORD,
    TERMS,
   
    
    
    PROFILE_PIC,
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

INSERT INTO USERS (
    USER_ID,
  
    EMAIL,
    PASSWORD
   
   
 
 
   
    
    
    
) VALUES (

'A_1',

'hemalhemal787@gmail.com',
'123'




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


