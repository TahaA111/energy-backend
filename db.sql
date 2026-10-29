CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY,
    date TEXT,
    kwh REAL,
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY,
    total REAL,
    average REAL,
    min REAL,
    max REAL,
    cost REAL,
    user_id INTEGER REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS users ( 
    id INTEGER PRIMARY KEY,
     name TEXT, 
     email TEXT UNIQUE,
      username TEXT UNIQUE,
       password TEXT
       );