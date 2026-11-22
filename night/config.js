// KYPSN Night 라이브 설정. ntfyTopic 또는 formAction·sheetId가 모두 비어 있으면 '로컬 모드'(같은 브라우저 안에서만 동작, 시험용)
window.NIGHT_CONFIG = {
  // 실시간 중계: ntfy.sh 주제(받은 글은 12시간 뒤 자동 삭제). 행사 당일 새 주제로 바꾸면 시험 데이터와 섞이지 않음
  ntfyTopic: "kypsn-night-601827f5da4347fe",
  // 구글 폼 응답 주소: https://docs.google.com/forms/d/e/<폼ID>/formResponse
  formAction: "",
  // 폼 문항별 entry 번호 (폼 문항 제목: kind, cid, name, role, question, meet, target, ask)
  entries: { kind: "", cid: "", name: "", role: "", question: "", meet: "", target: "", ask: "" },
  // 응답 시트 ID (링크가 있는 모든 사용자 보기 권한 필요)
  sheetId: "",
  sheetGid: "",
  // 행사 뒤 이어질 오픈 카톡방 (없으면 버튼 숨김)
  openChat: "",
  joinUrl: "https://kypsn.org/night/",
  // 질문 대상 (첫 항목이 기본값)
  // 질문 대상: 순서(2부 강연·3부 패널)별 묶음
  qaGroups: [
    { part: "talk", label: "2부 강연", targets: ["나원주", "박수용"] },
    { part: "panel", label: "3부 패널 토론", targets: ["패널 전체", "최병욱", "백승재", "김윤명"] }
  ],
  targets: ["나원주", "박수용", "패널 전체", "최병욱", "백승재", "김윤명"],
  pollMs: 4000
};
