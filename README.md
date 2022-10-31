# updateServer

## 업데이트 서버 현재 사양

1. _token : 
  xsrf 용 토큰으로 => 토큰이 없으면 접근이 불가능한데, 장비 agent나 헬스체크 등등 토큰이 없는 api들은 제외하고 적용

2. 세션에 시리얼/라이센스 정보만 관리
3. 세션에 대해 만료기간이라던가 관리 포인트 없음

----------------------------------------------------------

## 2022-10-26
* 업데이트 서버 사양 변경을 지양하기 위해 session login 방식으로 구현 결정
* Update Server 특성상 과부화의 위험이 없기 때문에 memorystore를 사용하여 보안 강화

--------------------------------------------------------------
### 2022-10-28 리뷰 후 개선 필요 사항

* 로그인 시 오류와 정상 처리에 대한 응답 포맷 일관되게

  ```json
  {
      "statusCode": 401,
      "message": "This serial is expired since [만료 날짜]",
      "error": "Unauthorized"
  }
  {
      "status": 202,
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
  * httpContext: 어디서든 Request의 data를 사용할 수 있게 Request의 data를 저장할 데이터 임시 저장소와 같은 역할을 한다.
  * 로그인/로그아웃의 setSession에서는 httpContext에 저장해 둘 데이터가 없으므로 해당 코드를 삭제 처리한다.
  ```typescript
  setSession(session: CSession, user, req: Request) {
      session.sessionId = req.sessionID;
      assign(session, user);

      return session;
    }
  ```
  
* 로그인 국가 별 API 구분하기

  * 입력 받은 url에서 lang 파라미터를 가져와 검사한다.

  ```typescript
  if (lang.toUpperCase() !== ser.slice(1, 3)) {
          message = `Serial number is not supported in ${lang.toUpperCase()}.`;
          throw new BadRequestException();
        }
  ```

* 서버단에서의 쿠키 관리 구현하기
