const express = require("express");
const got = require("got");

const app = express();

// CORS 설정 (cors 패키지 없이 직접 설정)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://52.79.142.181:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: 개발자센터에 로그인해서 내 결제위젯 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
// @docs https://docs.tosspayments.com/reference/using-api/api-keys
const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

// 백엔드 API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://52.79.142.181:8080";

app.post("/confirm", function (req, res) {
  const { paymentKey, orderId, amount } = req.body;

  // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
  // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
  // @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
  const encryptedSecretKey =
    "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

  // 결제 승인 API를 호출하세요.
  // 결제를 승인하면 결제수단에서 금액이 차감돼요.
  // @docs https://docs.tosspayments.com/guides/payment-widget/integration#3-결제-승인하기
  got
    .post("https://api.tosspayments.com/v1/payments/confirm", {
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      json: {
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,
      },
      responseType: "json",
    })
    .then(function (response) {
      // 토스 페이먼츠 결제 승인 성공 후, 백엔드 API로 결제 정보 저장
      got
        .post(`${BACKEND_API_URL}/api/payments/confirm`, {
          headers: {
            "Content-Type": "application/json",
          },
          json: {
            paymentKey: paymentKey,
            orderId: orderId,
            amount: amount,
          },
          responseType: "json",
        })
        .then(function (backendResponse) {
          // 백엔드 저장 성공
          console.log("백엔드 결제 정보 저장 성공:", backendResponse.body);
          res.status(response.statusCode).json(response.body);
        })
        .catch(function (backendError) {
          // 백엔드 저장 실패해도 토스 페이먼츠 결제는 성공했으므로 성공 응답 반환
          console.error("백엔드 결제 정보 저장 실패:", backendError.message);
          res.status(response.statusCode).json(response.body);
        });
    })
    .catch(function (error) {
      // TODO: 결제 실패 비즈니스 로직을 구현하세요.
      console.error("토스 페이먼츠 결제 승인 실패:", error.response?.body || error.message);
      const statusCode = error.response?.statusCode || 500;
      const errorBody = error.response?.body || { message: "결제 승인에 실패했습니다." };
      res.status(statusCode).json(errorBody);
    });
});

app.listen(4242, () =>
  console.log(`http://localhost:${4242} 으로 샘플 앱이 실행되었습니다.`)
);
