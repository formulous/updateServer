## 개요

* 업데이트 서버 사용자 인증을 구현한다.
* 로그인/로그아웃 기능을 구현한다.
* 토큰을 발급하고 갱신하는 등 관리한다.

## 상세 설계

### DB Schema

|*Field*|*Type*|*Null*|*Key*|*Default*|*Extra*|
|-----|-----|-----|-----|-----|-----|
|ser| varchar(15)| NO| PRI| NULL| |
|lic| varchar(16)| NO| PRI| NULL| |
|co| varchar(30)| YES| | NULL| |
|admin| varchar(20)| YES| | NULL| |
| tel| varchar(20)| YES| | NULL| |
| mail| varchar(30)| YES| | NULL| |
| ver| varchar(14)| YES| | NULL| |
| date| varchar(8)| YES| | NULL| |
| limit_date| varchar(8)| YES| | NULL| |
| mac| varchar(12)| YES| | NULL| |
| charge| varchar(20)| YES| | NULL| |
| business| varchar(20)| YES| | NULL| |
| note| varchar(20)| YES| | NULL| |
| down| char(3)| NO| | yes| |


### 로그인 설계

* 로그인 인증 과정 (JWT)

![image](https://user-images.githubusercontent.com/88424067/197101416-f18c8b4e-a129-4761-b425-e1b52a2b9144.png)

* 로그인 후 일반적인 API 요청 과정

![image](https://user-images.githubusercontent.com/88424067/197101448-5a6b2848-ce45-464c-9797-b72c06b3a2f5.png)

```
1. serialNum, licenseNum을 입력하여 로그인 요청
2. 검증 후 access token, refresh token 발급
3. 클라이언트는 토큰을 Cookie에 저장, 
4. 서버에 api 요청 시 Cookie에 담긴 토큰 정보로 사용자 인증
5. 서버는 토큰 검증 후 요청에 응답
```

### 로그인 API

* method : POST
* API : {국가 정보}/login
* 국가: kr / jp / en ( default: kr )

* 로그인 api 요청 예시

``` json
// method: POST
// url : http://10.0.13.224:4105/kr/login

data : 
{
  "ser": "IJPS8I001099001",
  "lic": "6a54e99101222356"
}

response :
{
  "access_token": "AYjcyMzY3ZDhiNmJkNTY",
  "refresh_token": "RjY2NjM5NzA2OWJjuE7c",
  "token_type": "bearer",
  "expires": 3600
}
```

### Error Handling

1. 입력한 정보가 db에 존재하지 않을 경우 (404: Not Found)

```json
{
    "statusCode": 404,
    "message": "the serial information does not exist",
    "error": "Not Found"
}
```

2. 국가 정보가 맞지 않은 경우 (400: Bad Request)

```json
{
    "statusCode": 400,
    "message": "This serial does not support Korean",
    "error": "Bad Request"
}
```

3. 입력한 정보가 유효하지 않을 경우 (400: Bad Request)

```json
{
    "statusCode": 400,
    "message": "Input data is not valid",
    "error": "Bad Request"
}
```

4. 입력한 정보의 정책이 만료되었을 경우 (401: Unauthorized)

```json
{
    "statusCode": 401,
    "message": "This serial is expired",
    "error": "Unauthorized"
}
```

### 로그아웃

* 로그아웃 시 Client 단에서 Cookie에 저장된 Token을 삭제해주고 Login 화면으로 이동 시켜준다.

### 토큰 관리

* 토큰에 담을 정보
  * HEADER : ALGORITHM & TOKEN TYPE
 
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
  * PAYLOAD : DATA
  
```json
{
  "ver": "IPSEF",
  "limit_date": "20191231"
  ...
}
```
 * SIGNATURE

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  
your-256-bit-secret

) secret base64 encoded
```

### 토큰 갱신 방식 (Refresh Token)

![image](https://user-images.githubusercontent.com/88424067/197101701-8044b3e9-b130-4a77-8169-cc9274715ec7.png)

```
1. 서버에 리소스 요청
2. 토큰 검증 -> 토큰 만료 401, unauthorized 응답
3. 토큰 만료 응답이 올 경우 refresh 토큰을 전송해 토큰 재발급 요청
4. refresh 토큰의 만료 여부를 검증한 후 토큰 재발급
5. 서버에 리소스 재요청
```

### 토큰 유효기간 설정

* access token은 발급 받은 후 6시간-24시간(정책에 따라 변동 가능)동안 유효하다. refresh token은 2주간 유효하며,
refresh token 만료가 7일 이내로 남은 시점에서 사용자 토큰 갱신 요청을 하면 갱신된 access token과 갱신된 refresh token이 함께 반환된다.


### 토큰 관리 프로세스

![image](https://user-images.githubusercontent.com/88424067/197101742-5e18008b-7770-43da-8985-b57e2a24d823.png)

* 로그인 시 Cookie에 유효 기간이 짧은 access token과 유효 기간이 긴 refresh token을 발급한다.
* api 요청 시 Cookie에 저장돼 있는 access token을 검증하여 응답한다.
* access 토큰 만료 시에 refresh token을 전송하여 access토큰 재발급을 받는다.
* refresh token이 만료 시에 재로그인을 필요로 한다.
* 로그아웃 시 Cookie에 저장된 token 정보를 삭제해준다.

### 사용 모듈

```
1. react-jwt
 => 클라이언트에서 토큰 만료시간을 얻음
 => 클라이언트에서 api 요청 시 header에 토큰을 담아서 보냄
2. @nestjs/jwt
3. passport
4. passport-jwt
5. @nestjs/passport
 => 서버에서 토큰 발급 및 인증, 사용자 인증 수행
```

## 세션과 토큰의 차이

### 차이점 1. 사이즈
세션을 사용시 주고받는 session id의 크기는 매우 작습니다.
반면 (JWT기준) 토큰은 같은 데이터를 담고 있어도 그에 비해 크기가 큽니다.

### 차이점 2. 안전성

* 세션
세션은 서버측에서 저장/관리하기 때문에 상대적으로 온전한 상태를 유지하기 유리합니다.
하지만 여전히 공격의 위험이 있기에 유효기간, HttpOnly, Secure 옵션 등을 주어 쿠키에 저장합니다.

* 토큰
반대로 토큰은 웹 브라우저측 (local storage, 혹은 쿠키 등)에 저장되기 때문에 공격에 노출될 가능성이 더 큽니다.
이런 경우를 대비해 토큰에는 민감한 정보를 담지 않습니다.
그리고 유효기간을 짧게 설정해 공격에 노출될 수 있는 시간을 최소화합니다.
하지만 짧은 주기로 토큰이 무효화되면 서비스 사용자는 계속 로그인을 해줘야 하는 번거로움이 있기 때문에
애초에 로그인(인증)시 refresh token이라는 것을 추가적으로 발급합니다.
refresh token은 좀 더 긴 유효기간을 가졌으며 최대한 안전한 곳에 저장됩니다.
기존의 토큰이 만료되거나 변질되면 refresh token을 통해 토큰을 재발급합니다.

### refresh 토큰을 사용하지 않으면....

access token을 만료시간 없이 사용 ->





