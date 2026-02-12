# 질문 개정 초안 (1103 게이트볼 v2)

목표: 2011.03 환경(1103)에서 실제로 덱 분별력이 생기는 질문만 남긴다.

## 방향성

- 제외: 현대 OCG 문맥 질문
  - 선공/후공 선호
  - 범용 카드 비중
  - 과도한 특소/현대식 전개 기준
- 강화: 1103 운영 문맥 질문
  - 자원 교환(1:1, 2:1) 선호
  - 백로우 운영/제거 타이밍
  - 압박 템포 vs 장기전 운영
  - 리스크 감수(상대 세트 체크, 라인 강행)

## 교체 제안 (기존 -> 신규)

1. `q10`(사고 감수) -> `q10`(리소스 교환 성향)
2. `q11`(루트 암기) -> `q11`(백로우 운영 성향)
3. `q17`(필드 장악력) -> `q17`(역전/굳히기 플랜)

---

## q10 (신규안)

```json
{
  "id": "q10",
  "text": "한 장 교환(1:1) 중심 운영과 고점 노림 중 어느 쪽을 선호하시나요?",
  "answers": [
    {
      "id": "q10a1",
      "text": "안전한 1:1 교환을 반복한다",
      "effects": [
        { "axis": "stability", "value": 6 },
        { "axis": "interaction", "value": 4 },
        { "axis": "ceiling", "value": -4 }
      ]
    },
    {
      "id": "q10a2",
      "text": "조금 유리한 교환 위주",
      "effects": [
        { "axis": "stability", "value": 3 },
        { "axis": "interaction", "value": 2 }
      ]
    },
    {
      "id": "q10a3",
      "text": "상황 따라 선택",
      "effects": []
    },
    {
      "id": "q10a4",
      "text": "약간 손해를 감수해도 템포를 잡는다",
      "effects": [
        { "axis": "tempo", "value": 3 },
        { "axis": "ceiling", "value": 2 },
        { "axis": "stability", "value": -2 }
      ]
    },
    {
      "id": "q10a5",
      "text": "고점 라인 강행이 좋다",
      "effects": [
        { "axis": "ceiling", "value": 6 },
        { "axis": "tempo", "value": 2 },
        { "axis": "stability", "value": -4 }
      ]
    }
  ]
}
```

## q11 (신규안)

```json
{
  "id": "q11",
  "text": "세트한 마함은 어떤 식으로 운영하는 편인가요?",
  "answers": [
    {
      "id": "q11a1",
      "text": "최대한 아끼며 확실할 때만 사용",
      "effects": [
        { "axis": "stability", "value": 4 },
        { "axis": "difficulty", "value": 2 },
        { "axis": "tempo", "value": -2 }
      ]
    },
    {
      "id": "q11a2",
      "text": "가치 교환이 보이면 바로 사용",
      "effects": [
        { "axis": "interaction", "value": 3 },
        { "axis": "tempo", "value": 1 }
      ]
    },
    {
      "id": "q11a3",
      "text": "균형형",
      "effects": []
    },
    {
      "id": "q11a4",
      "text": "초반부터 강하게 오픈해 템포를 잡는다",
      "effects": [
        { "axis": "tempo", "value": 4 },
        { "axis": "interaction", "value": 2 },
        { "axis": "stability", "value": -2 }
      ]
    },
    {
      "id": "q11a5",
      "text": "리스크를 감수하고 라인을 빠르게 민다",
      "effects": [
        { "axis": "tempo", "value": 6 },
        { "axis": "ceiling", "value": 2 },
        { "axis": "stability", "value": -4 }
      ]
    }
  ]
}
```

## q17 (신규안)

```json
{
  "id": "q17",
  "text": "불리한 판세에서 어떤 선택을 더 자주 하나요?",
  "answers": [
    {
      "id": "q17a1",
      "text": "손해를 줄이며 장기전으로 복구",
      "effects": [
        { "axis": "stability", "value": 6 },
        { "axis": "interaction", "value": 2 },
        { "axis": "tempo", "value": -2 }
      ]
    },
    {
      "id": "q17a2",
      "text": "최소 리스크로 역전각을 만든다",
      "effects": [
        { "axis": "stability", "value": 2 },
        { "axis": "ceiling", "value": 2 }
      ]
    },
    {
      "id": "q17a3",
      "text": "상황 따라 선택",
      "effects": []
    },
    {
      "id": "q17a4",
      "text": "기회가 보이면 강하게 돌파한다",
      "effects": [
        { "axis": "ceiling", "value": 4 },
        { "axis": "tempo", "value": 2 }
      ]
    },
    {
      "id": "q17a5",
      "text": "리스크를 크게 감수해 역전을 노린다",
      "effects": [
        { "axis": "ceiling", "value": 6 },
        { "axis": "tempo", "value": 2 },
        { "axis": "stability", "value": -4 }
      ]
    }
  ]
}
```

---

## 수치 조정 권장

- `q14a4`의 `interaction: -10`은 1103 문맥에서도 과도함.
- 아래처럼 완화 권장:

```json
{
  "id": "q14a4",
  "text": "장기전",
  "effects": [
    { "axis": "interaction", "value": 4 },
    { "axis": "tempo", "value": -2 },
    { "axis": "ceiling", "value": -2 }
  ]
}
```

## 1103 기준 운영 체크리스트

- 질문이 "카드군 고유 전개력"보다 "운영 선택"을 묻는가?
- 모든 질문에 중립 선택지(`effects: []`)가 있는가?
- 특정 축에만 과도한 ±10이 몰려 있지 않은가?
- 태그 질문(싱크로/엑시즈/융합/상관없음)은 유지하되, 결과 해석 문구에서 1103 메타 맥락을 반영했는가?
