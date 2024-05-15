require("dotenv").config();

let options = {
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "deeb_book_schema",

  clearExpired: true, // 만료된 세션 지우기
  checkExpirationInterval: 10000, // 만료된 세션이 지워지는 빈도
  expiration: 1000 * 60 * 60 * 2, // 세션 수명: 2시간
};

module.exports = options;
