import type { ReasoningTraining } from '../../engine/types';
import { h } from '../dom';
import type { ScreenContext } from '../screens/context';

/**
 * Treino de raciocínio pericial: cada afirmação é classificada. Errar mostra a
 * explicação e permite tentar de novo; só a primeira tentativa vale ponto.
 */
export function reasoningTraining({ store }: ScreenContext, c: ReasoningTraining): HTMLElement {
  const s = store.get();
  const allCorrect = c.items.every((q) => s.training.answers[q.id] === q.correct);

  return h(
    'section',
    { class: 'screen treino' },
    h('h2', {}, c.title),
    h('p', { class: 'lede' }, c.lede),
    h(
      'ol',
      { class: 'questions' },
      ...c.items.map((q) => {
        const given = s.training.answers[q.id];
        const ok = given === q.correct;
        return h(
          'li',
          { class: 'question' },
          h('p', { class: 'statement' }, q.prompt),
          h(
            'div',
            { class: 'choice-row', role: 'group', 'aria-label': q.prompt },
            ...q.options.map((o) =>
              h(
                'button',
                {
                  class: `chip${given === o.id ? (ok ? ' is-picked' : ' is-wrong') : ''}`,
                  disabled: ok,
                  onclick: () => store.answerTraining(q.id, o.id, q.correct),
                },
                o.text,
              ),
            ),
          ),
          given
            ? h(
                'p',
                { class: `explanation ${ok ? 'is-ok' : 'is-wrong'}`, 'aria-live': 'polite' },
                ok ? `Correto. ${q.explanation}` : 'Ainda não. Pense no que esse fato prova sozinho, sem o resto do caso.',
              )
            : null,
        );
      }),
    ),
    h(
      'div',
      { class: 'actions' },
      h(
        'button',
        { class: 'btn primary', disabled: !allCorrect, onclick: () => store.goTo('laboratorio') },
        allCorrect ? 'Ir para o laboratório' : 'Acerte todas para continuar',
      ),
    ),
  );
}
