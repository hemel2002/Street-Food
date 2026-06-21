DECLARE
  -- Declare cursor to select customer reviews
  CURSOR customer_reviews_cursor IS
    SELECT C_NAME, REVIEW_MESSAGE, RATING
    FROM CUSTOMERREVIEWSVENDOR;
    
  -- Variables to hold the values of each row
  v_c_name CUSTOMERREVIEWSVENDOR.C_NAME%TYPE;
  v_review_message CUSTOMERREVIEWSVENDOR.REVIEW_MESSAGE%TYPE;
  v_rating CUSTOMERREVIEWSVENDOR.RATING%TYPE;

BEGIN
  -- Open cursor
  OPEN customer_reviews_cursor;
  
  -- Fetch each row and process it
  LOOP
    -- Fetch data into variables
    FETCH customer_reviews_cursor INTO v_c_name, v_review_message, v_rating;
    
    -- Exit loop when no more rows are found
    EXIT WHEN customer_reviews_cursor%NOTFOUND;
    
    -- Print out or process the values
    DBMS_OUTPUT.PUT_LINE('Customer Name: ' || v_c_name);
    DBMS_OUTPUT.PUT_LINE('Review: ' || v_review_message);
    DBMS_OUTPUT.PUT_LINE('Rating: ' || v_rating);
    DBMS_OUTPUT.PUT_LINE('-----------------------------');
  END LOOP;
  
  -- Close cursor
  CLOSE customer_reviews_cursor;
END;