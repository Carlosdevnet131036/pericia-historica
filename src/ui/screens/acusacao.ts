import { h } from '../dom';
import type { Screen } from './context';

export const acusacao: Screen = ({ caseFile: c, store }) => {
  const s = store.get();
  const { answers, submitted } = s.accusation;
  const allAnswered = c.accusation.every((q) => answers[q.id]);

  const pick = (qid: string, oid: string) =>
    store.update((st) => ({ ...st, accusation: { ...st.accusation, answers: { ...st.accusation.answers, [qid]: oid } } }));

  return h(
    'section',
    { class: 'screen acusacao' },
    h('h2', {}, 'Conclusão do inspetor'),
    h('p', { class: 'lede' }, 'Com o laudo em mãos, responda o que a prova permite afirmar. Depois de enviar, as respostas ficam registradas.'),
    h(
      'ol',
      { class: 'questions' },
      ...c.accusation.map((q) =>
        h(
          'li',
          { class: 'question' },
          h(
            'fieldset',
            { disabled: submitted },
            h('legend', {}, q.prompt),
            ...q.options.map((o) => {
              const id = `q-${q.id}-${o.id}`;
              const state = submitted ? (o.id === q.correct ? ' is-correct' : answers[q.id] === o.id ? ' is-wrong' : '') : '';
              return h(
                'label',
                { class: `option${state}`, for: id },
                h('input', {
                  type: 'radio',
                  id,
                  name: `q-${q.id}`,
                  checked: answers[q.id] === o.id,
                  onchange: () => pick(q.id, o.id),
                }),
                h('span', {}, o.text),
              );
            }),
            submitted ? h('p', { class: 'explanation' }, q.explanation) : null,
          ),
        ),
      ),
    ),
    h(
      'div',
      { class: 'actions' },
      submitted
        ? h('button', { class: 'btn primary', onclick: () => store.goTo('revelacao') }, 'Ver o que realmente aconteceu')
        : h(
            'button',
            {
              class: 'btn primary',
              disabled: !allAnswered,
              onclick: () => store.update((st) => ({ ...st, accusation: { ...st.accusation, submitted: true } })),
            },
            allAnswered ? 'Enviar conclusão' : 'Responda todas as perguntas',
          ),
    ),
  );
};
