## 1. 요구사항

* 검색 조건에 따라 패턴을 조회할 수 있어야 한다
* 검색 조건에 맞게 패턴 테이블이 달라져야 한다
* 국가 코드에 맞게 도움말 테이블이 달라져야 한다
* 검색된 패턴으로 패턴 파일이 생성되어야 한다

## 2. User Story
|*User Story*|*Feature List*|*Feature Spec*|
|-----|-----|-----|
|사용자는 그리드에서 보지 않을 컬럼을 설정하기 위해 마우스 우클릭을 한다.|-컨텍스트 메뉴|1. 활성화<br>-메뉴가 항상 활성화 된 상태|

## 3. Database 설계

* example table: EXT_SNIPER_PATTERN
  * 나머지 Table은 #109889 일감 확인

|*Field*|*Type*|*Null*|*Key*|*Default*|*Extra*|
|-----|-----|------|-----|-----|-----|
|T_CODE|int(5)|NO|PRI|0||
H_CODE|int(5)|NO|PRI|0||
PATTERN|varchar(128)|YES||NULL||
NAME|varchar(128)|NO||||
UPDATE_DATE|varchar(14)|NO||||
modify_date|varchar(14)|YES||NULL||
spublish|int(1) unsigned|NO||0||
REQRSP|int(4)|NO||0||
FILTER|int(4)|NO||0||
DETECT|int(4)|NO||0||
BLOCKING|int(4)|NO||0||
BLACKHOLE|int(4)|NO||0||
RISK|int(4)|NO||0||
RAW|int(4)|NO||0||
ALARM|int(4)|NO||0||
LIMIT_CNT|int(4)|NO||0||
EXPIRE|int(4)|NO||0||
PROTOCOL|int(4)|NO||0||
SPORT|int(4)|NO||0||
ICMPTYPE|int(4)|NO||0||
ICMPCODE|int(4)|NO||0||
ICMPSEQ|int(4)|NO||0||
PTYPE|int(4)|NO||0||
RULE_DELETE|int(4)|NO||0||
NOCASE|int(4)|NO||0||
METHOD|int(4)|NO||0||
ABSTRACT_ATTACKER|varchar(15)|NO||255.255.255.255||
ABSTRACT_VICTIM|varchar(15)|NO||255.255.255.255||
ABSTRACT_ATTACKER_V6|varchar(15)|YES||128||
ABSTRACT_VICTIM_V6|varchar(15)|YES||128||
OFFSET|int(5) unsigned|NO||1548||
O_FLAG|int(5) unsigned|NO||2||

## 4. API 설계

* `method: POST`
* `API: /[국가정보]/get_list`
 * `국가 : kr/jp/en`

### 4-1. parameter

 |*parameter*|*type*|*example*|*description*|
 |-----|-----|-----|-----|
 |sourcedate|string|20220930000000|검색기간 - 검색 시작 날짜|
 |destinationdate|string|20220930235959|검색기간 - 검색 마지막 날짜|
 |SW_SERIAL|string|SKRO1CWIT206221|시리얼|
 |SW_LICENSE|string|af7a5ba37c74896c|라이센스|
 |ndelete|int|0|유형 - 업데이트(0) / 롤백(1)|
 |ENCRYPT|int|1|비암호화(0) / 암호화(1)|
 |BLOCK|int|0|차단 - 비적용(0) / 적용(1)|
 |product|string|one|제품코드 (one, lus, ips)|
 |GUI 외에 센서 자동 다운로드시, tmsp, ngfw, aptx 등도 존재함.<br/>*(※ jp의 경우 미존재)*|
 |pbcheck|int|1|카테고리 - PatternBlock 체크(1) / 미체크 (0) *(※ jp의 경우 false 고정)*|
 |webcheck|int|1|카테고리 - WebCGI 체크(1) / 미체크 (0) *(※ jp의 경우 false 고정)*|
 |regcheck|int|1|카테고리 - RegEx 체크(1) / 미체크 (0) *(※ jp의 경우 false 고정)*|
 |release|int|1|패턴 - 비공개(0) / 공개(1) *(※ jp의 경우 미존재)*|
 |START_PATTERN_NUM|string|4000|코드범위 - 시작 번호 *(※ jp의 경우 미존재)*|
 |END_PATTERN_NUM|string|5000|코드범위 - 마지막 번호 *(※ jp의 경우 미존재)*|

### 4-2. API 요청 예시
```javascript
{
  sourcedate: 20220930000000
  destinationdate: 20220930235959
  SW_SERIAL: SKRO1CWIT206221
  SW_LICENSE: af7a5ba37c74896c
  product: one
  ndelete: 0
  ENCRYPT: 1
  BLOCK: 0
  pbcheck: 1
  webcheck: 1
  regcheck: 1
  release: 1
  START_PATTERN_NUM: 
  END_PATTERN_NUM: 
}
```
### 4-3. Response 예시
* Status Code: 200 OK
* Response
```json
{
   "serial":"SKRLELWIS232093",
   "_patternBlockList":[아래 예시1 참고],
   "_patternWebCgiList":[아래 예시2 참고],
   "_snortList":[아래 예시3 참고],
   "patternFilePath":"<a href=\/kr\/one\/pattern_download?file_path=one_pattern\/SKRLELWIS232093\/20221012100941.patternc ><img src='\/img\/download_en_n.png' onmouseover=\"this.src='\/img\/download_en_s.png'\" onmouseout=\"this.src='\/img\/download_en_n.png'\" style='cursor:pointer;' alt='download'>",
   "patternCount":{
      "patternblock":30,
      "webCGI":10,
      "snort":152
   }
}

예시1. _patternBlockList 예시 2개: 
      {
         "cate":1100,
         "code":7095,
         "name":"LibreHealth acl_admin.php action XSS",
         "updatedate":"20221012100717" 
      },
      {
         "cate":1100,
         "code":7094,
         "name":"Win32\/Ransomware.SamSam.195596",
         "updatedate":"20221007094130" 
      },

예시2. _patternWebCgiList 예시 2개:
      {
         "cate":1300,
         "code":6232,
         "name":"School Dormitory Management System admin s XSS",
         "updatedate":"20221007094256" 
      },
      {
         "cate":1300,
         "code":6231,
         "name":"IIPImage iipsrv.fcgi iiif Memory Corruption.A",
         "updatedate":"20221007082906" 
      },

예시3. _snortList 예시 2개
      {
         "cate":2402,
         "code":11353,
         "name":"PrestaShop AP PageBuilder apajax.php SQL Injection",
         "updatedate":"20221012100941" 
      },
      {
         "cate":2402,
         "code":11352,
         "name":"WordPress Plugin RSVPMaker rsvp_id SQL Injection",
         "updatedate":"20221012095028" 
      },
```

### 화면 설계

* kr/ en GUI 구성
 * ![image](https://user-images.githubusercontent.com/88424067/199653781-c909a360-12d2-4146-8630-9f0451b98c97.png)
 * ![image](https://user-images.githubusercontent.com/88424067/199653811-b8a3ebc1-7030-496f-8758-92032d36ff7d.png)

* jp GUI 구성
 * ![image](https://user-images.githubusercontent.com/88424067/199653834-cff2a0bb-0928-4fc7-a4f9-1cd42e948743.png)
 * jp의 경우 없거나, 고정인 항목이 있다.
  * 미존재 항목(4) : START_PATTERN_NUM, END_PATTERN_NUM, release, product
  * 고정값 항목(3) : pbcheck, webcheck, regcheck => false
