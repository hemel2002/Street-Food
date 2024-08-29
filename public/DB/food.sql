CREATE SEQUENCE FOOD_SEQ
    START WITH 1
    INCREMENT BY 1
    NOMAXVALUE;

CREATE TABLE "SYSTEM"."FOOD" (
    "FOOD_ID" VARCHAR2(50),
    "FOOD_NAME" VARCHAR2(100),
    "PRICE" NUMBER,
    "RATING" NUMBER,
    "AVAILABILITY" VARCHAR2(10),
    "FOOD_PIC" VARCHAR2(255),
    "ORIGINAL_PATH" VARCHAR2(255),
    "INGREDIENT" VARCHAR2(4000),
    "CREATE_DATE" TIMESTAMP (6) DEFAULT SYSTIMESTAMP,
    "CATEGORY" VARCHAR2(255),
    PRIMARY KEY ("FOOD_ID") USING INDEX ENABLE
);

CREATE OR REPLACE TRIGGER FOOD_ID_TRIGGER BEFORE
    INSERT ON FOOD FOR EACH ROW
DECLARE
    NEXT_VAL NUMBER;
BEGIN
    SELECT
        FOOD_SEQ.NEXTVAL INTO NEXT_VAL
    FROM
        DUAL;
    :NEW.FOOD_ID := 'F_'
                    || TO_CHAR(NEXT_VAL);
END;
/

-- Inserting data into FOOD table without specifying FOOD_ID
INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'sweet',
    100,
    9,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1720513340/food/cyjezshqsv9fbcaanlml.png',
    'asus.jpg',
    'Special'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'pizza',
    200,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718780085/food/s8ppmxib3yxde5azmk9f.jpg',
    'download (2).jpeg',
    NULL
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'chicken Burger',
    250,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718780143/food/oybe4nct9bzh3f8ausra.jpg',
    'download.jpeg',
    NULL
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'meatbox',
    150,
    6,
    NULL,
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719907436/food/esj92s21j4mitw0njhjm.png',
    'asus.jpg',
    'hfbh'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'Fushkah',
    27,
    0,
    'No',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719000294/food/wmrlloyoxkfoxubgo6rx.jpg',
    'sweet.jpeg',
    'none'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'Chicken Shawarma',
    230,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718780416/food/pehtkuidg2t8ws0jmaqm.jpg',
    'download (1).jpeg',
    NULL
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'Haleem',
    70,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718780555/food/ekxv1sdqysllwtmlvgs8.jpg',
    'Haleem.jpeg',
    NULL
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'pizza',
    100,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718991078/food/hmwomqdouvt3uhjooe0p.jpg',
    'download (4).jpeg',
    'none'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'Cold-Coffee',
    120,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1718999478/food/cnllix4npw9kndfafhwb.jpg',
    'coldcofee.jpeg',
    'Brewed coffee (chilled or cold brewed), milk or cream, sweetener (sugar, flavored syrups), ice, optional flavorings (vanilla extract, chocolate syrup), optional toppings (whipped cream, ice cream).'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'ice cream',
    50,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719000830/food/krz2dauwvevfajms6gke.jpg',
    'ice.jpeg',
    'none'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'Fast food',
    120,
    0,
    'Yes',
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719571908/food/oowte8zwvfidutvgafpq.jpg',
    'download (5).jpeg',
    'null'
);

INSERT INTO FOOD (
    FOOD_NAME,
    PRICE,
    RATING,
    AVAILABILITY,
    FOOD_PIC,
    ORIGINAL_PATH,
    INGREDIENT
) VALUES (
    'bal',
    10,
    0,
    NULL,
    'https://res.cloudinary.com/da7hqzvvf/image/upload/v1719673524/food/plxjlvuz41jbyvc2iav7.png',
    'asus.jpg',
    'none'
);