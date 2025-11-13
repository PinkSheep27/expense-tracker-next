CREATE INDEX IF NOT EXISTS idx_expenses_user_id 
ON expenses(user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_date 
ON expenses(date);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
ON expenses(user_id, date);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id 
ON expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id 
ON categories(user_id);