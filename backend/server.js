// Node.js 기본 모듈만 사용하는 백엔드입니다.
const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const files = {
  '/': ['index.html', 'text/html'],
  '/style.css': ['style.css', 'text/css'],
  '/app.js': ['app.js', 'text/javascript'],
};

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Weather API status: ${response.status}`);
  return response.json();
}

async function weather(city) {
  // 도시 검색 API가 짧은 한글 이름을 찾지 못하는 경우를 보완합니다.
  const aliases = {
    서울: 'Seoul', 서울특별시: 'Seoul', 부산: 'Busan', 부산광역시: 'Busan',
    인천: 'Incheon', 대구: 'Daegu', 대전: 'Daejeon', 광주: 'Gwangju',
    울산: 'Ulsan', 제주: 'Jeju', 제주도: 'Jeju', 제주시: 'Jeju',
    수원: 'Suwon', 춘천: 'Chuncheon', 강릉: 'Gangneung', 전주: 'Jeonju',
    청주: 'Cheongju', 포항: 'Pohang', 여수: 'Yeosu', 세종: 'Sejong',
  };
  const search = new URL('https://geocoding-api.open-meteo.com/v1/search');
  search.search = new URLSearchParams({ name: Object.hasOwn(aliases, city) ? aliases[city] : city, count: '1', language: 'ko', format: 'json' });
  const locations = await fetchJson(search);
  const location = locations.results?.[0];
  if (!location) return null;

  const forecast = new URL('https://api.open-meteo.com/v1/forecast');
  forecast.search = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
    timezone: 'auto', wind_speed_unit: 'ms',
  });
  const data = await fetchJson(forecast);
  if (!data.current || !Number.isFinite(data.current.temperature_2m)) {
    throw new Error('Invalid weather response');
  }
  return {
    location: { name: location.name, region: location.admin1 || '', country: location.country || '' },
    current: data.current, units: data.current_units, timezone: data.timezone,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method !== 'GET') return json(res, 405, { error: 'GET 요청만 지원합니다.' });
    if (url.pathname === '/api/weather') {
      const city = (url.searchParams.get('city') || '').trim();
      if (city.length < 2 || city.length > 100) {
        return json(res, 400, { error: '도시 이름을 2~100자로 입력해 주세요.' });
      }
      try {
        const data = await weather(city);
        if (!data) return json(res, 404, { error: '도시를 찾을 수 없습니다. 영문 이름으로도 검색해 보세요.' });
        return json(res, 200, data);
      } catch (error) {
        console.error('Weather request failed:', error.message);
        return json(res, 502, { error: '날씨 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' });
      }
    }
    const file = files[url.pathname];
    if (!file) return json(res, 404, { error: '페이지를 찾을 수 없습니다.' });
    const content = await readFile(path.join(__dirname, '..', 'frontend', file[0]));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8` });
    res.end(content);
  } catch (error) {
    console.error(error.message);
    json(res, 500, { error: '서버 오류가 발생했습니다.' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, '127.0.0.1', () => console.log(`날씨 앱: http://localhost:${port}`));
}
module.exports = { server };
