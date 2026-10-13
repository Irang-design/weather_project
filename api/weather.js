// Vercel은 이 파일을 /api/weather 서버리스 함수로 실행합니다.
// 로컬 서버와 동일한 날씨 조회 로직을 사용합니다.
const { handler } = require('../backend/server');

module.exports = handler;
