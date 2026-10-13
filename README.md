# 간단한 날씨 웹앱

HTML, CSS, JavaScript와 Node.js 기본 모듈만 사용합니다. 프레임워크나 추가 패키지는 없습니다.

## 파일 구분

```text
weather/
├── frontend/
│   ├── index.html    # 화면 구조
│   ├── style.css     # 반응형 스타일
│   └── app.js        # 검색 요청과 결과 표시
├── backend/
│   └── server.js     # 정적 파일 제공 및 외부 날씨 API 호출
├── package.json
└── README.md
```

## 실행 방법

1. Node.js 22 이상을 설치합니다: https://nodejs.org/
2. 터미널에서 이 프로젝트 폴더로 이동합니다. PowerShell 예시:
   ```powershell
   cd 'C:\vibe_coding\Week7 강의자료-20261013\weather'
   ```
3. 서버를 시작합니다. `npm install`은 필요 없습니다.
   ```powershell
   npm start
   ```
   PowerShell에서 npm 실행 정책 오류가 나면 `node backend/server.js`로 실행하세요.
4. 브라우저에서 http://localhost:3000 에 접속합니다. HTML 파일을 직접 열지 마세요.
5. `서울`, `부산`, `Tokyo`, `London` 등을 입력하고 **날씨 확인** 버튼을 누릅니다. Enter 키도 가능합니다.
6. 서버를 종료하려면 터미널에서 `Ctrl+C`를 누릅니다.

포트 3000을 다른 앱이 사용한다면 PowerShell에서 `$env:PORT = '3001'`을 실행한 뒤 서버를 시작하고 http://localhost:3001 로 접속하세요.

## 동작 흐름

브라우저 → `GET /api/weather?city=서울` → 백엔드 → Open-Meteo 도시 검색 API → 좌표 → Open-Meteo 현재 날씨 API → 백엔드 → 브라우저.

외부 API 호출은 모두 백엔드에서 수행합니다. 도시명은 URLSearchParams로 인코딩하며, 외부 요청에는 10초 제한을 적용합니다. 빈 입력, 도시 검색 실패, 외부 API 장애에 한국어 오류 메시지를 표시합니다.

기온, 날씨 상태, 체감 온도, 습도, 풍속 및 도시 현지 기준 시각을 표시합니다. 도시명이 중복되면 첫 번째 검색 결과를 사용하므로 결과의 지역과 국가를 확인하세요. 한글 검색에 실패하면 영문 도시명으로 검색해 보세요.

## 외부 서비스

- 현재 날씨: https://open-meteo.com/en/docs
- 도시 검색: https://open-meteo.com/en/docs/geocoding-api
- API 키 없이 사용 가능한 무료 비상업용 API를 사용합니다. 상업용 서비스에는 별도 이용 조건이 적용됩니다: https://open-meteo.com/en/pricing
- 현재 날씨는 기상 모델 기반 데이터입니다. 백엔드에 인터넷 연결이 필요합니다.
- 데이터 제공처 Open-Meteo와 GeoNames 링크를 화면에 표시합니다.

## Vercel 배포

로컬 실행 방법은 위와 같습니다. Vercel에서는 정적 프론트엔드와 서버리스 API로 실행됩니다.

- `backend/build.js`: 프론트엔드 파일을 배포용 `dist/`에 복사합니다.
- `api/weather.js`: `/api/weather` 요청을 기존 백엔드 처리 함수로 전달합니다.
- `vercel.json`: 빌드 명령, 출력 디렉터리 및 API 실행 시간을 설정합니다.

1. Vercel에서 이 GitHub 저장소를 Import합니다.
2. Root Directory는 저장소 루트로 둡니다. `frontend` 또는 `backend`를 선택하지 마세요.
3. Framework Preset은 **Other**를 사용합니다. 별도 빌드 설정 Override는 끄고 `vercel.json`을 사용하세요.
4. Deploy를 누릅니다. API 키나 환경 변수는 필요 없습니다.
5. GitHub의 `main` 브랜치에 새 커밋이 올라가면 연결된 Vercel 프로젝트가 자동 재배포합니다.

기존 프로젝트의 Root Directory나 Output Directory Override가 다르게 설정되어 있으면 위 설정으로 수정한 다음 Redeploy하세요. 배포 후 `/`에서 화면이 보이고 `/api/weather?city=Seoul`에서 JSON이 반환되는지 확인하세요.
