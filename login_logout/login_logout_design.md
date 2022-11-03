## 개요

* 업데이트 서버 사용자 인증을 구현한다.
* 세션 기반 로그인/로그아웃 기능을 구현한다.

## 상세 설계

### DB Schema

|Field|Type|Null|Key|Default|Extra|
|-----|-----|-----|-----|-----|-----|
|ser| varchar(15)| NO| PRI| NULL| |
| lic| varchar(16)| NO| PRI| NULL| |
| co| varchar(30)| YES| | NULL| |
| admin| varchar(20)| YES| | NULL| |
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

* 로그인 인증 과정 

![image](https://user-images.githubusercontent.com/88424067/198510585-45182c13-e561-4d0e-b1d3-1c5dd02cc7e6.png)

* 로그인 후 일반적인 API 요청 과정

![image](https://user-images.githubusercontent.com/88424067/198510621-45bc38de-8f87-45f0-8bff-74c63179120b.png)

  1. serialNum, licenseNum을 입력하여 로그인 요청
  2. 세션 저장소에 유저 정보와 대응되는 세션 생성
  3. 인증 성공 시 세션 ID 응답, 클라이언트는 반환 된 sessionid 는 쿠키에 저장
  4. 서버에 api 요청 시 Cookie에 담긴 세션 id와 함께 요청
  5. 서버는 세션 id를 검사하고 응답
  6. 로그아웃 시 저장된 session 제거

### 업데이트 서버에 세션을 사용하는 이유

* 세션은 서버 단에 데이터를 저장 할 저장소를 따로 마련 해야해서 과부화가 일어날 수 있다는 단점과 보안 측면에서의 강점이 공존한다.
* 업데이트 서버 특성 상 서버 과부화가 발생할 일이 없으므로 보안적 측면에서 유리한 세션을 사용

### 로그인 API

* method : POST
* API : {국가 정보}/login
* 국가: kr / jp / en ( default: kr )

* 로그인 api 요청 예시

* method and url

```
method: POST

url : http://10.0.13.224:4105/kr/login
```

* Body

```json
{
    "ser": "SKRO5CWIT202036",
    "lic": "e8c4ffbea9e72579"
}
```

* Response

```json
{
    "status": 201,
    "message": "Login Success"
}
```

----------------------------------------------------------------------------

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
    "message": "This serial is expired since [만료 날짜]",
    "error": "Unauthorized"
}
```

### 로그아웃

* 로그아웃 시 Memorystore에 저장된 sessionID를 삭제 처리 해준다.

* method and url

```
method: GET

url : http://10.0.13.224:4105/[국가정보]/logout
```

### 세션 유효기간 설정

  세션 유효기간은 따로 설정해두지 않고, 로그아웃 하기 전까지 유효하도록 설정 (기존의 업데이트 서버 사양을 따라 감)

### 사용 모듈

    1. express
    2. moment // ser 만료 확인을 위한 날짜 비교
    3. express-http-context


