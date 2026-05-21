import { formatDate } from '../../lib/formatDate';

export function createHeaderDateDisplay(now: Date = new Date()): string {
  return `
    <div class="page-header__date" aria-label="오늘 날짜">
      <p class="page-header__eyebrow">Today</p>
      <p class="page-header__date-value">${formatDate(now)}</p>
    </div>
  `;
}
