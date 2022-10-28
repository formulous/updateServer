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
<pre>
data : 
{
    "ser": "SKRO5CWIT202036",
    "lic": "e8c4ffbea9e72579"
}
```
** Response
```json
response :
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

url : http://10.0.13.224:4105/kr/logout
```

### 세션 유효기간 설정

<pre>
세션 유효기간은 따로 설정해두지 않고, 로그아웃 하기 전까지 유효하도록 설정 (기존의 업데이트 서버 사양을 따라 감)
</pre>

### 사용 모듈

  1. express
  2. moment // ser 만료 확인을 위한 날짜 비교
  3. express-http-context

### 2022-10-28 리뷰 후 개선 필요 사항

* 로그인 시 오류와 정상 처리에 대한 응답 포맷 일관되게
```json
// 오류 발생시
{
    "statusCode": 401,
    "message": "This serial is expired since [만료 날짜]",
    "error": "Unauthorized"
}
// 정상 처리시
{
    "status": 202,
    "sessionId": "VzScJwHuVpPPYeH8F_MuBM2JaIYTh-vB",
    "message": "Login Success"
}
```
* 서비스 단에 서비스 로직만 존재하도록 유효성 검증 파이프로 모으기
* login api 적용 부
```typescript
 @Post('/login')
  doLogin(
    @Body(LoginValidationPipe) userDto: UserDto,
    @Session() session: CSession,
    @Request() req
  ): any {
    Logger.info('Login To Update Server...', userDto);
    return this.loginService.login(userDto, session, req);
  }

```
* LoginValidationPipe 구현 부
```typescript
import {
  ArgumentMetadata,
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import moment = require('moment');
import { Logger } from '../logger/logger.util';
import { UserRepository } from '../shared/db/repository/user.repository';

@Injectable()
export class LoginValidationPipe implements PipeTransform<any> {
  constructor(private userRepository: UserRepository) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    const { ser, lic } = value;
    let message = '';

    try {
      // 국가 정보 일치 검사
      if (ser.slice(1, 3) === 'JP' || ser.slice(1, 3) === 'US') {
        message = 'This serial does not support Korean';
        throw new BadRequestException();
      }

      //ser, lic 길이 검사
      if (!ser || !lic || ser.length > 15 || lic.length > 16) {
        message = `Input data is not valid`;
        throw new BadRequestException();
      }
      // db에서 user 검색
      const user = await this.userRepository.findOne({
        where: { ser, lic },
      });

      // db에 user 없을 시 NotFoundException
      if (!user) {
        message = `the serial information does not exist`;
        throw new NotFoundException();
      }

      // user 존재 시 만료 날짜를 날짜 비교에 맞는 포맷으로 변경 (26/10/2022 => 2022-10-26)
      if (user) {
        const year = user.limit_date.slice(0, 4);
        const month = user.limit_date.slice(4, 6);
        const day = user.limit_date.slice(6, 8);
        const expiredDate = [year, month, day].join('-');

        // 만료 날짜와 비교
        if (user.limit_date) {
          if (moment(expiredDate).isBefore(moment())) {
            message = `This serial is expired since ${expiredDate}`;
            throw new UnauthorizedException();
          }
        }
        return value;
      }
    } catch (err) {
      Logger.error(message, err.stack, {
        ser,
        lic,
      });
      throw new HttpException(
        {
          status: err.status,
          error: err.response.message,
          message: message,
        },
        err.status
      );
    }
  }
}
```

* httpContext 사용 이유 파악하고 코드 개선하기

* 로그인 국가 별 API 구분하기

* 서버단에서의 쿠키 관리 구현하기
