CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY,
    date TEXT,
    kwh REAL
);

CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY,
    total REAL,
    average REAL,
    min REAL,
    max REAL
);