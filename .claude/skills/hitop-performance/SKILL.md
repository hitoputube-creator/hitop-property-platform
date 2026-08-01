---
name: hitop-performance
description: Review Hitop Realty marketing performance from user-provided GA4, Search Console, Google Ads, Meta Ads, or CSV data. Use for /hitop-performance when the user supplies metrics such as sessions, impressions, CTR, clicks, click_phone, click_kakao, generate_lead, listing_id, or cost.
argument-hint: "GA4/Search Console/광고 CSV 또는 요약 수치"
disable-model-invocation: true
---

# /hitop-performance

Analyze the performance data in `$ARGUMENTS`.

First read `.claude/skills/hitop-marketing-common/references/brand-rules.md`.

Do not invent numbers. If data is incomplete, state what is missing and avoid statistically certain conclusions.

## Key metrics

사용자 수, 세션 수, 페이지 조회수, 유입경로, 검색어, 노출수, 클릭수, CTR, 평균 게재순위, `click_phone`, `click_kakao`, `generate_lead`, 매물별 `listing_id`, 페이지별 전환, 채널별 전환, 캠페인별 전환, 광고비, 전환당 비용.

## Output

1. 핵심 결과 요약
2. 잘된 부분
3. 문제점
4. 성과가 좋은 페이지
5. 성과가 좋은 콘텐츠
6. 전화·카카오·상담 전환 비교
7. 개선이 필요한 랜딩페이지
8. 다음 콘텐츠 주제
9. 광고 중단·확대 후보
10. 다음 7일 실행계획
11. 다음 30일 실행계획
12. 추가로 필요한 데이터

Separate observation, interpretation, and recommendation.
