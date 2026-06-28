UPDATE country
SET keywords = TRIM(CONCAT(code, ' ', tax))
WHERE keywords IS NULL OR TRIM(keywords) = '';
