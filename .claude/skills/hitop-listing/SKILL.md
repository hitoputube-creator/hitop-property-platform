---
name: hitop-listing
description: Convert one Hitop Realty listing into selected channel copy while filtering private information. Use for /hitop-listing with a channel and listing details or a public listing number.
argument-hint: "채널과 매물정보 또는 매물번호"
disable-model-invocation: true
---

# /hitop-listing

Create content for one selected channel from `$ARGUMENTS`.

First read `.claude/skills/hitop-marketing-common/references/brand-rules.md`. Use `.claude/skills/hitop-marketing-common/references/test-samples.md` only if the user asks for a sample or gives no real public listing data.

Allowed channels:

- 네이버 블로그 초안
- 네이버 카페 매물 소개
- 인스타그램 게시문
- 릴스 게시문
- 유튜브 쇼츠 대본
- 유튜브 일반 영상 구성
- 문자 안내
- 카카오톡 고객 안내
- 카드뉴스 페이지 구성
- 15초 광고 훅
- 30초 광고 대본

If the user requests every channel at once, ask them to choose 1-3 channels first.

## Listing fields to use when provided

매물번호, 지역, 매물종류, 거래유형, 대지면적, 건축면적, 연면적, 층수, 보증금, 월세, 매매가, 용도지역, 건축물 용도, 입주 가능일, 주차, 진입도로, 전력, 층고, 주요 특징, 사진 설명, 현장 메모.

## Privacy filter

Never include owner/customer names, phone numbers, internal notes, passwords, door codes, private detailed addresses, Supabase IDs, or non-public pricing/negotiation notes.

## Output

1. 사용한 공개 정보
2. 추가 확인 필요 정보
3. 선택 채널용 초안
4. 제목 또는 첫 문장 후보
5. CTA
6. 게시 전 검토 체크리스트

Do not fill missing facts with guesses.
