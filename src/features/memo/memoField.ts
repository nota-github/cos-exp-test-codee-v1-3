const MEMO_TEXTAREA_ID = 'today-memo';
const MEMO_HINT_ID = 'today-memo-hint';

export function createMemoField(labelledBy: string): string {
  return `
    <div class="memo-field" aria-labelledby="${labelledBy}">
      <label class="memo-field__label" for="${MEMO_TEXTAREA_ID}">짧게 이어 적는 오늘 메모</label>
      <p id="${MEMO_HINT_ID}" class="memo-field__hint">줄바꿈으로 여러 생각을 가볍게 남길 수 있습니다.</p>
      <textarea
        class="memo-field__input"
        id="${MEMO_TEXTAREA_ID}"
        name="todayMemo"
        rows="8"
        aria-describedby="${MEMO_HINT_ID}"
        placeholder="오늘 남기고 싶은 한 줄이나 집중 포인트를 적어보세요."
      ></textarea>
    </div>
  `;
}
