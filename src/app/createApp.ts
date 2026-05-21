import { createHeaderDateDisplay } from '../features/header/dateDisplay';
import { createMoodSelector } from '../features/mood/moodSelector';

const todoExamples = ['발표 자료 마무리', '운동 20분', '답장 보낼 메일 정리'];

export function createApp(root: HTMLElement): void {
  const headerDateDisplay = createHeaderDateDisplay();

  root.innerHTML = `
    <main class="page-shell">
      <header class="page-header" aria-labelledby="app-title">
        <div class="page-header__topline">
          ${headerDateDisplay}
          <p class="page-header__hint">현재 기기 기준 오늘 날짜와 체크인 내용을 한 화면에서 확인하는 로컬 대시보드</p>
        </div>
        <div class="page-header__content">
          <div>
            <p class="page-header__eyebrow">Single Screen Check-In</p>
            <h1 id="app-title">오늘의 미니 체크인</h1>
            <p class="page-header__description">
              오늘의 기분, 꼭 할 일 세 가지, 짧은 메모를 한 화면 안에서 정리하는 가벼운 대시보드입니다.
            </p>
          </div>
        </div>
      </header>

      <section class="dashboard-grid" aria-label="오늘의 미니 체크인 섹션">
        <section class="panel panel--mood" aria-labelledby="mood-title">
          <div class="panel__header">
            <p class="panel__eyebrow">Mood</p>
            <h2 id="mood-title">오늘의 기분</h2>
          </div>
          ${createMoodSelector('mood-title')}
          <p class="panel__support">세 가지 선택지는 항상 동시에 보이며, 한 번에 하나의 기분만 선택할 수 있습니다.</p>
        </section>

        <section class="panel panel--todo" aria-labelledby="todo-title">
          <div class="panel__header">
            <p class="panel__eyebrow">Top 3</p>
            <h2 id="todo-title">할 일 세 가지</h2>
          </div>
          <ul class="todo-list" aria-label="오늘의 할 일 입력 프레임">
            ${todoExamples
              .map(
                (item, index) => `
                  <li class="todo-row">
                    <label class="todo-row__checkbox">
                      <span class="sr-only">할 일 ${index + 1} 체크</span>
                      <input type="checkbox" />
                    </label>
                    <label class="todo-row__field">
                      <span class="sr-only">할 일 ${index + 1}</span>
                      <input type="text" placeholder="${item}" />
                    </label>
                  </li>
                `,
              )
              .join('')}
          </ul>
          <p class="panel__support">정확히 세 개의 입력 행을 고정 노출해 한눈에 훑을 수 있는 밀도를 유지합니다.</p>
        </section>

        <section class="panel panel--memo" aria-labelledby="memo-title">
          <div class="panel__header">
            <p class="panel__eyebrow">Note</p>
            <h2 id="memo-title">짧은 메모</h2>
          </div>
          <label class="memo-field">
            <span class="sr-only">짧은 메모 입력</span>
            <textarea rows="7" placeholder="오늘 남기고 싶은 한 줄이나 집중 포인트를 적어보세요."></textarea>
          </label>
          <p class="panel__support">메모는 할 일과 분리된 카드에서 관리해 화면 위계를 단순하게 유지합니다.</p>
        </section>
      </section>
    </main>
  `;
}
