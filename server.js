const { createProxyMiddleware } = require("http-proxy-middleware");

const express = require("express");
const db = require("database/db");

const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "../deeb-front/build")));

app.use(
	"/v1",
	createProxyMiddleware({
		target: "https://openapi.naver.com",
		changeOrigin: true,
	})
);

app.get('/', (req, res) => {
	// db에서 쿼리 실행
    db.query('SELECT * FROM table_name', function(e, results, fields) {
        if (e) throw err;
		// 결과를 json 형식으로 클라이언트에 반환
        res.send(results);
    });
});


app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../deeb-front/build/index.html"));
});

app.listen(8000, () => {
	// 8000번 포트로 서버 실행
	console.log("listening on 8000");
});
