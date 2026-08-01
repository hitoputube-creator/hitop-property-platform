---
name: hitop-review
description: Final compliance and quality review for Hitop Realty blog drafts, ads, card news, video scripts, listing copy, or social posts before publication. Use for /hitop-review when checking whether content is safe to publish.
argument-hint: "게시 전 검토할 원고"
disable-model-invocation: true
---

# /hitop-review

Review the draft in `$ARGUMENTS` before publication.

First read `.claude/skills/hitop-marketing-common/references/brand-rules.md`.

Return one of:

- 게시 가능
- 수정 후 게시
- 게시 보류

## Check

- 사실과 원문 일치
- 매물정보 일치
- 가격·면적·근거자료 일치
- 고객 개인정보 노출 여부
- 소유주 정보 노출 여부
- 상세주소 과다 노출 여부
- 내부 메모 노출 여부
- 과장 표현
- 허위 광고 위험
- 법률·세무 확정 표현
- 맞춤법
- 제목과 본문 일치
- 중복 문장
- 검색어 과다 반복
- CTA 포함 여부
- 하이탑부동산 상호와 031-949-8969 표기
- 이미지에 부동산 워터마크 또는 공개 사용 권한이 있는지 확인해야 할 부분

## Output

1. 판정
2. 반드시 수정할 부분
3. 권장 수정
4. 개인정보 마스킹 필요 여부
5. 사실 확인 필요 항목
6. 수정 문장 예시
7. 게시 전 확인 체크리스트
