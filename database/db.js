const mysql = require("mysql");

require("dotenv").config();

const dbConncection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "deeb_book_schema",
});

dbConncection.connect((e) => {
  if (e) console.log(e);
  else console.log("db 연결 성공");
});

module.exports = dbConncection;
