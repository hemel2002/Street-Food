CREATE TABLE "SYSTEM"."CUSTOMERREVIEWSVENDOR" (
    "C_ID" VARCHAR2(100) NOT NULL,
    "V_ID" VARCHAR2(100) NOT NULL,
    "REVIEW_MESSAGE" VARCHAR2(4000),
    "RATING" NUMBER(1, 0) DEFAULT 0,
    "REPLY" VARCHAR2(4000) DEFAULT 'No reply yet',
    "C_DATE" TIMESTAMP(6) DEFAULT SYSTIMESTAMP,
    "C_NAME" VARCHAR2(255),
    "V_REPLY_DATE" TIMESTAMP(6),
    "V_NAME" VARCHAR2(100),
    "C_EMAIL" VARCHAR2(150) NOT NULL,
    "COMPLAINT_DETAILS" COMPLAINTS,
    CONSTRAINT "PK_CUSTOMERREVIEWSVENDOR" PRIMARY KEY ("C_ID", "V_ID"),
    CONSTRAINT "FK_CUSTOMERREVIEWSVENDOR_C_ID" FOREIGN KEY ("C_ID") REFERENCES "SYSTEM"."CUSTOMERS" ("C_ID") ON DELETE CASCADE,
    CONSTRAINT "FK_CUSTOMERREVIEWSVENDOR_V_ID" FOREIGN KEY ("V_ID") REFERENCES "SYSTEM"."VENDORS" ("V_ID") ON DELETE CASCADE
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_8',
    'S_17',
    4,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 12.28.58.094000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'fahim',
    'fahim12@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Great quality at reasonable prices—highly recommended!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_8',
    'S_21',
    5,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 12.44.46.481000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'game',
    'fahim12@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Great quality at reasonable prices—highly recommended!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_11',
    'S_17',
    2,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 02.46.22.441000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'fahim',
    'shahriar12688@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Absolutely loved the sushi at this place! It was fresh and flavorful. The service was prompt and courteous. Will definitely come back!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_11',
    'S_21',
    4,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 02.47.06.992000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'game',
    'shahriar12688@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Absolutely loved the sushi at this place! It was fresh and flavorful. The service was prompt and courteous. Will definitely come back!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_10',
    'S_16',
    3,
    'Thank you so much for your kind words! We Are thrilled to hear that you enjoyed the tacos and that the spices were just right for you. Our vendor will be delighted to know you appreciated the quick and friendly service. We look forward to serving you again soon!',
    TO_TIMESTAMP('26-JUL-24 02.42.48.590000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'gfhft',
    TO_TIMESTAMP('29-JUL-24 02.17.12.792000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    'nahid123@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'The food was absolutely delicious! The tacos were freshly made and the spices were just perfect. The vendor was friendly and quick with the service. Highly recommend!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_7',
    'S_11',
    4,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 02.49.05.659000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'fahim',
    'fahim@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Had an amazing experience with Taco Fiesta. The burritos were hearty and delicious. The staff were welcoming and efficient. Highly recommend this place!'
);

INSERT INTO CUSTOMERREVIEWSVENDOR (
    C_ID,
    V_ID,
    RATING,
    REPLY,
    C_DATE,
    C_NAME,
    V_REPLY_DATE,
    V_NAME,
    C_EMAIL,
    COMPLAINT_DETAILS,
    REVIEW_MESSAGE
) VALUES (
    'U_9',
    'S_17',
    3,
    'No reply yet',
    TO_TIMESTAMP('26-JUL-24 02.50.34.180000000 AM', 'DD-MON-YY HH.MI.SS.FF AM'),
    'fahim',
    NULL,
    'fahim',
    'nahid13@gmail.com',
    COMPLAINTS(NULL, NULL, NULL, NULL, NULL),
    'Great quality at reasonable prices—highly recommended!'
);