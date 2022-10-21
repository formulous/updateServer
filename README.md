# updateServer

## 업데이트 서버 현재 사양

1. _token : 
  xsrf 용 토큰으로 => 토큰이 없으면 접근이 불가능한데, 장비 agent나 헬스체크 등등 토큰이 없는 api들은 제외하고 적용

2. 세션에 시리얼/라이센스 정보만 관리
3. 세션에 대해 만료기간이라던가 관리 포인트 없음

----------------------------------------------------------

업데이트 서버 개선 개발

* 2022-10-19 리뷰 회의 진행 후 개선 사항

## logging module

1. 로그 Rotate, (size, 값 선정 기준??) 작성
2. API 요청 시 응답 값 예시 작성
3. API 파일 구분 혹은, serialNum 별로 로그 파일 구분해서 저장 가능한지 여부
- log level에 따른 구분 저장은 가능한 것으로 확인
4. log file 열었을 때 cat으로 연것처럼 깔끔하게 나올 수 있는지 (후속 조치사항)
- log에 colorize 옵션을 제거해 파일에 따로 컬러 설정이 출력되지 않도록 함

## login/logout 기능 설계 (2022-10-21 까지)

1. 로그인 시 토큰 처리 방법 (db 사용하지 말고 관리할 수 있는 방법)
- Client 단의 Cookie를 이용
2. 특정 페이지 접근 시 인증 방법 (업데이트 서버의 경우 GUI 정보 조회 페이지에선 따로 제약이 없이 보여줘야 함)
- 로그인 시에만 db 정보와 비교 후 jwt Token을 제공, 인증이 필요한 경우에 대해 Guard 사용
3. 로그아웃 시 토큰 처리 방법
- Client 단에서 access token을 삭제
4. 토큰 만료 시간, 토큰 갱신 방법
- accesstoken : 만료시간 10m
5. 토큰에 담을 정보 설계
- header:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- payload:
```json
{
  "ver": "IPSEF",
  "limit_date": "20191231" 
  ...
}
```
- signature:
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),

your-256-bit-secret

) secret base64 encoded
```
6. 일반적인 api 요청 과정
- 로그인 후 발급받은 access token으로 auth 인증

10.21 까지 필요 사항
* 로그인 인증 과정 설계
* 에러 응답 방식 어떻게 할지 (code 500 , 400 ...)
* 인증 방식 설계 (jwt token, session ...)
