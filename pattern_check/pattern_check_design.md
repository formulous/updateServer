# 요구사항

* 검색 조건에 따라 패턴을 조회할 수 있어야 한다
* 검색 조건에 맞게 패턴 테이블이 달라져야 한다
* 국가 코드에 맞게 도움말 테이블이 달라져야 한다
* 검색된 패턴으로 패턴 파일이 생성되어야 한다

# User Story
|*User Story*|*Feature List*|*Feature Spec*|
|-----|-----|-----|
|사용자는 그리드에서 보지 않을 컬럼을 설정하기 위해 마우스 우클릭을 한다.|-컨텍스트 메뉴|1. 활성화<br>-메뉴가 항상 활성화 된 상태|

# Database 설계
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
METHOD|int(4)|NO|0||
ABSTRACT_ATTACKER|varchar(15)|NO||255.255.255.255||
ABSTRACT_VICTIM|varchar(15)|NO||255.255.255.255||
ABSTRACT_ATTACKER_V6|varchar(15)|YES||128||
ABSTRACT_VICTIM_V6|varchar(15)|YES||128||
OFFSET|int(5) unsigned|NO||1548||
O_FLAG|int(5) unsigned|NO||2||
