## 프로젝트 실행 방법
- npm run start:dev 를 터미널 창에 입력해 주세요.
- 테스트 코드 실행을 위해서는 npm test 을 터미널 창에 입력해 주세요.

## API 사용 방법
- swagger를 사용하거나, search 폴더 하위의 test 폴더 안에 있는 search.http 파일을 통해 api 호출 테스트를 진행할 수 있습니다.
- 자세한 사용 방법은 swqgger에 명시해 두었습니다.

## 구현한 기능 목록
- 검색어 저장 기능은 회원의 경우 회원 정보가 함께 저장되도록 구현하였고, 비회원의 경우, IP 정보를 찾아와 저장하도록 구현하였습니다.
- 검색어 조회 기능은 필터링 조건이 없을 경우 전체 데이터에 대한 24시간 내의 인기 검색어 10개를 조회하며, 순위 변동 정보를 제공합니다.
- 필터링 조건이 있을 경우 필터링 조건이 다양해 이전 순위를 기록하는 것이 비효율적이어서 실시간 순위만 제공합니다.
  
   
