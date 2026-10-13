const form = document.querySelector('#weather-form');
const button = document.querySelector('#submit');
const status = document.querySelector('#status');
const card = document.querySelector('#weather');
const setText = (id, value) => { document.getElementById(id).textContent = value; };

function describe(code, isDay) {
  if (code === 0) return ['맑음', isDay ? '☀️' : '🌙'];
  if (code === 1) return ['대체로 맑음', isDay ? '🌤️' : '🌙'];
  if (code === 2) return ['구름 조금', '⛅'];
  if (code === 3) return ['흐림', '☁️'];
  if ([45, 48].includes(code)) return ['안개', '🌫️'];
  if ([51, 53, 55].includes(code)) return ['이슬비', '🌦️'];
  if ([56, 57, 66, 67].includes(code)) return ['얼어붙는 비', '🌧️'];
  if ([61, 63, 65, 80, 81, 82].includes(code)) return ['비', '🌧️'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['눈', '🌨️'];
  if ([95, 96, 99].includes(code)) return ['뇌우', '⛈️'];
  return ['날씨 정보', '🌡️'];
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = document.querySelector('#city').value.trim();
  card.hidden = true;
  status.hidden = false;
  status.className = '';
  if (city.length < 2) {
    status.textContent = '도시 이름을 2자 이상 입력해 주세요.';
    status.className = 'error';
    return;
  }
  button.disabled = true;
  button.textContent = '조회 중…';
  status.textContent = '현재 날씨를 가져오고 있습니다…';
  form.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { signal: AbortSignal.timeout(25000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '날씨를 가져오지 못했습니다.');
    const current = data.current;
    const [description, icon] = describe(current.weather_code, current.is_day);
    const format = (value, unit) => Number.isFinite(value) ? `${value}${unit}` : '정보 없음';
    setText('location', data.location.name);
    setText('region', [...new Set([data.location.region, data.location.country].filter(Boolean))].join(' · '));
    setText('temperature', current.temperature_2m.toFixed(1));
    setText('description', description);
    setText('icon', icon);
    setText('feels-like', format(current.apparent_temperature, ' °C'));
    setText('humidity', format(current.relative_humidity_2m, '%'));
    setText('wind', format(current.wind_speed_10m, ' m/s'));
    setText('updated', `기준 시각: ${current.time.replace('T', ' ')} · ${data.timezone} 현지 시간`);
    status.textContent = `${data.location.name}의 현재 날씨를 표시했습니다.`;
    status.hidden = true;
    card.hidden = false;
  } catch (error) {
    status.textContent = error.name === 'TimeoutError' ? '응답이 늦어지고 있습니다. 다시 시도해 주세요.' : error instanceof TypeError ? '서버에 연결할 수 없습니다. 서버 실행 상태를 확인해 주세요.' : error.message;
    status.className = 'error';
  } finally {
    button.disabled = false;
    button.textContent = '날씨 확인 ↗';
    form.removeAttribute('aria-busy');
  }
});
