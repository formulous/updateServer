## 1. 요구사항

|항목|설명|
|:---|:---|
|로그인 로그아웃| 사용자에 대한 로그인 로그아웃 기능이 제공되어야 한다.|

## 2. User Story 

| 구분 | User Strory | Feature List |
|:---|:---|:---|
|로그인|사용자는 로그인 하기 위해 로그인 페이지에 접속 한 후 serial number/ license number를<br/>입력하고 로그인 한다.|1. serial nuber입력란<br/>2. license number 입력란<br/>3. 확인 버튼|
|로그아웃|사용자는 로그아웃 하기 위해 접속중인 페이지에서 로그아웃 버튼을 누른다.|1. 로그아웃 버튼|

## 3. 화면 설계

-- 설계 중 --

## 4. Database 설계

![image](https://user-images.githubusercontent.com/88424067/196349358-8030385e-ed3f-4851-af7f-5a56000f28c3.png)

## 5. API 설계

### 로그인

* method : POST
* API : `{국가 정보}/login`
  국가 : kr / jp / en ( default : kr )
* data

| *data* | *type* | *comment* |
|:---|:---|:---|
| `SW_SERIAL` | string | 예시) SKRO1CWIT206221 |
| `SW_LICENSE` | string | 예시) af7a5ba37c74896c |
| `_token`  | string | 자체적으로 발급해주는 토큰, 웹 브라우저 상의 user 관리용 |

### 로그아웃

* method : GET
* API : `{국가 정보}/logout`
