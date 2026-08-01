# 하이탑부동산 Claude 마케팅 스킬 사용법

이 폴더는 하이탑부동산 프로젝트 전용 Claude Code 스킬입니다. 홈페이지 기능, SEO 파일, GA4, 광고 전환 코드, Supabase, Kakao 지도, 상담 기능을 변경하지 않습니다.

## 설치된 스킬

| 명령 | 목적 |
| --- | --- |
| `/hitop-plan` | 하나의 주제나 매물을 채널별 마케팅 계획으로 정리 |
| `/hitop-listing` | 매물 정보를 선택한 채널의 콘텐츠 초안으로 변환 |
| `/hitop-seo` | 파주·운정 지역 SEO 콘텐츠 구조 기획 |
| `/hitop-ad` | Google Ads, Meta, 유튜브, 배너, CTA 문구 생성 |
| `/hitop-competitor` | 공개 경쟁 콘텐츠 분석과 차별화 아이디어 도출 |
| `/hitop-performance` | GA4, Search Console, 광고 성과 자료 분석 |
| `/hitop-review` | 게시 전 원고의 사실성, 개인정보, 광고 규정 최종 검토 |

공통 기준은 `/hitop-marketing-common` 스킬과 `hitop-marketing-common/references/brand-rules.md`에 있습니다.

## 입력 예시

```text
/hitop-plan
주제: 파주에서 200평 이상 대형 자동차정비공장 임대 매물을 찾는 고객을 위한 마케팅 콘텐츠 기획
```

```text
/hitop-listing
채널: 네이버 블로그
매물번호: HITOP-12345
지역: 파주시 월롱면
매물종류: 공장
거래유형: 임대
특징: 차량 진입 가능, 창고 겸용 검토 가능
```

```text
/hitop-seo
키워드: 파주 공장 용도변경 비용
```

```text
/hitop-ad
목표: 카카오 상담
주제: 파주 공장 임대 매물
```

```text
/hitop-competitor
자료: 사용자가 제공한 공개 URL 또는 광고 문구
```

```text
/hitop-performance
자료: GA4 또는 Search Console CSV 요약
```

```text
/hitop-review
자료: 게시 예정 블로그 원고
```

## 필요한 자료

- 매물 콘텐츠: 공개 가능한 매물번호, 지역, 종류, 거래유형, 면적, 가격, 입주 가능일, 진입도로, 전력, 층고, 사진 설명, 공개 가능 현장 메모
- 부동산 뉴스 콘텐츠: 기준일, 공식 출처 URL, 정책 또는 통계의 적용 지역
- 성과 분석: 기간, 채널, 사용자 수, 세션, 노출수, 클릭수, CTR, `click_phone`, `click_kakao`, `generate_lead`, 비용

## 개인정보 주의

고객명, 고객 연락처, 소유주 정보, 이메일, 상세주소, 내부 메모, 비밀번호, API key, Supabase service role key, 광고 계정 비밀번호는 입력하지 않는 것이 원칙입니다. 자료에 포함되어 있으면 그대로 쓰지 말고 마스킹합니다.

공개 대표 전화 `031-949-8969`는 사용할 수 있습니다.

## 작업 순서

매물 콘텐츠는 `공개 매물 정보 확인 -> 부족한 정보 표시 -> 채널 선택 -> 초안 작성 -> /hitop-review 최종 검토` 순서로 사용합니다.

부동산 뉴스 콘텐츠는 `주제 선택 -> 기준일과 공식 출처 확인 -> /hitop-seo 또는 /hitop-plan -> 원고 작성 -> /hitop-review` 순서로 사용합니다.

성과 분석은 `CSV 또는 요약 수치 준비 -> /hitop-performance -> 다음 7일/30일 실행계획 정리` 순서로 사용합니다.

광고 문구는 `/hitop-ad`로 초안을 만든 뒤 실제 Google Ads 또는 Meta 관리자에서 사용자가 직접 검토하고 입력합니다.

## 자동화 단계와 차이

이번 스킬은 콘텐츠 기획과 검토를 돕는 명령 모음입니다. 네이버 블로그 자동 로그인, 유튜브 자동 업로드, 인스타그램 자동 게시, 광고 캠페인 자동 생성, n8n 자동화, API 연결은 포함하지 않습니다.
