# Update Server Logging Module 개발

## 개요

* [winston] 을 이용한 로그 모듈 개발
* error, info, message, callstack 제공

## 상세 설명

### 사용 예시

<pre>
Logger.info('INFO Message', {
          name: "object's name",
          cause: 'select information',
        });
</pre>

* 위와 같이 parameter에 ('표시 할 메세지', '표시 할 객체 데이터')를 입력하여 로그를 생성 해준다.


* 사용 예시 상세

```typescript
try {
      switch (type) {
        case 'warning':
          Logger.warning('WARNING Message', {
            name: "object's name",
            cause: 'sql injection',
          });
          break;
        case 'debug':
          Logger.debug('DEBUG Message', {
            name: "object's name",
            cause: 'try debugging',
          });
          break;
        case 'info':
          Logger.info('INFO Message', {
            name: "object's name",
            cause: 'select information',
          });
          break;
        case 'log':
          // levels : 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug'
          Logger.log('notice', 'LOG Message', {
            name: "object's name",
            cause: 'sql injection',
          });
          break;
        default:
          throw new InternalServerErrorException();
      }
    } catch (err) {
      Logger.error('ERROR Message', err.stack);
    }
```

* error의 경우 try catch 구문으로 잡아낸 error의 stack 정보를 함께 출력 해준다.

* Logger.log는 parameter 값으로 level 옵션을 추가해준다.

* level 옵션의 종류

** ![image](https://user-images.githubusercontent.com/88424067/196343768-acf3daea-7d64-4ab3-b18e-fe93212c8a37.png)

### 결과 화면
 
* 콘솔 출력

![image](https://user-images.githubusercontent.com/88424067/196343859-fa58664f-8327-4bfb-9dd4-7a48befb35f3.png)

* 로그 출력

![image](https://user-images.githubusercontent.com/88424067/196343945-0274e6c1-3957-4c6f-8de5-0ee0542027a0.png) 
