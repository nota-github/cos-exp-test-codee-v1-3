type TodoSlotDefinition = {
  id: string;
  placeholder: string;
};

const TODO_SLOTS: readonly TodoSlotDefinition[] = [
  { id: 'todo-1', placeholder: '발표 자료 마무리' },
  { id: 'todo-2', placeholder: '운동 20분' },
  { id: 'todo-3', placeholder: '답장 보낼 메일 정리' },
];

export function createTodoSlots(labelledBy: string): string {
  return `
    <ul class="todo-list" aria-labelledby="${labelledBy}">
      ${TODO_SLOTS.map((slot, index) => {
        const slotNumber = index + 1;
        const checkboxId = `${slot.id}-checkbox`;
        const inputId = `${slot.id}-input`;

        return `
          <li class="todo-row" data-todo-slot="${slot.id}">
            <label class="todo-row__checkbox" for="${checkboxId}">
              <span class="sr-only">할 일 ${slotNumber} 체크</span>
              <input class="todo-row__checkbox-input" id="${checkboxId}" type="checkbox" />
            </label>
            <label class="todo-row__field" for="${inputId}">
              <span class="sr-only">할 일 ${slotNumber}</span>
              <input id="${inputId}" type="text" placeholder="${slot.placeholder}" />
            </label>
          </li>
        `;
      }).join('')}
    </ul>
  `;
}
