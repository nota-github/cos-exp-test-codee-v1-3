import { MOOD_OPTIONS } from './moodOptions';

const MOOD_GROUP_NAME = 'today-mood';

export function createMoodSelector(labelledBy: string): string {
  return `
    <fieldset class="mood-selector" aria-labelledby="${labelledBy}">
      <legend class="sr-only">오늘의 기분 선택</legend>
      <div class="mood-options">
        ${MOOD_OPTIONS.map(
          (option) => `
            <label class="mood-option" data-mood-key="${option.key}">
              <input class="mood-option__input" type="radio" name="${MOOD_GROUP_NAME}" value="${option.key}" />
              <span class="mood-option__content">
                <span class="mood-option__label">${option.label}</span>
              </span>
            </label>
          `,
        ).join('')}
      </div>
    </fieldset>
  `;
}
