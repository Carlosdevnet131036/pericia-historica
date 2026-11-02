import { describe, expect, it } from 'vitest';
import { CASES } from '../cases';
import { rojas1892 } from '../cases/rojas1892';
import {
  beginSearch,
  EMPTY_SEARCH,
  HIT_RADIUS,
  hitTarget,
  isRunning,
  layoutSearch,
  pauseSearch,
  progressScore,
  registerFind,
  resumeSearch,
  searchElapsed,
  searchScore,
  searchStars,
  unlockedEvidence,
} from './search';
import { initialState } from './state';
import type { ObjectId } from './types';

const POOL: ObjectId[] = ['lamparina', 'chave', 'livro', 'xicara', 'relogio', 'tesoura', 'garrafa', 'chapeu', 'vela', 'oculos', 'moeda', 'carta'];
const TARGETS: ObjectId[] = ['chave', 'vela', 'moeda', 'carta'];

describe('layout das cenas de busca', () => {
  const placements = layoutSearch(42, TARGETS, POOL, 14);

  it('é determinístico: mesma semente, mesma cena', () => {
    expect(layoutSearch(42, TARGETS, POOL, 14)).toEqual(placements);
  });

  it('cada alvo aparece exatamente uma vez', () => {
    for (const t of TARGETS) expect(placements.filter((p) => p.target && p.id === t)).toHaveLength(1);
  });

  it('a bagunça nunca repete um tipo de alvo, para o clique não ser ambíguo', () => {
    expect(placements.filter((p) => !p.target).some((p) => TARGETS.includes(p.id))).toBe(false);
  });

  it('os objetos não se sobrepõem', () => {
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i]!;
        const b = placements[j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(HIT_RADIUS * (a.scale + b.scale));
      }
    }
  });

  it('clicar no centro de um alvo acerta; clicar longe não', () => {
    const t = placements.find((p) => p.target)!;
    expect(hitTarget(placements, [], t.x, t.y)?.id).toBe(t.id);
    expect(hitTarget(placements, [t.id], t.x, t.y)).toBeNull();
  });
});

describe('pontuação das cenas', () => {
  it('mais tempo, erros ou dicas nunca aumentam a nota', () => {
    expect(searchScore(30, 0, 0)).toBeGreaterThan(searchScore(60, 0, 0));
    expect(searchScore(30, 0, 0)).toBeGreaterThan(searchScore(30, 2, 0));
    expect(searchScore(30, 0, 0)).toBeGreaterThan(searchScore(30, 0, 1));
    expect(searchScore(999, 99, 99)).toBe(0);
  });

  it('uma cena completada vale de 1 a 5 estrelas', () => {
    expect(searchStars(1000)).toBe(5);
    expect(searchStars(0)).toBe(1);
  });
});

describe('dados das cenas e dos suspeitos', () => {
  it('as cenas de todos os casos têm alvos únicos e cabem na grade', () => {
    for (const c of CASES) {
      for (const l of c.locations) {
        if (!l.search) continue;
        expect(new Set(l.search.targets).size).toBe(l.search.targets.length);
        expect(l.search.targets.length + l.search.clutter).toBeLessThanOrEqual(32);
      }
    }
  });

  it('com o perfil completo, exatamente um suspeito confere com todas as características', () => {
    const profile = rojas1892.profile ?? [];
    const matches = (rojas1892.suspects ?? []).filter((sp) => profile.every((t) => sp.traits[t.id] === 'sim'));
    expect(matches.map((m) => m.id)).toEqual(['rojas']);
  });

  it('a pista que decide o caso só aparece depois do laboratório', () => {
    const decisive = (rojas1892.profile ?? []).find((t) => t.id === 'digital');
    expect(decisive?.revealedAt).toBe('acusacao');
  });
});

describe('progresso compartilhado entre a busca 2D e a exploração 3D', () => {
  const targets = rojas1892.locations.find((l) => l.id === 'rancho')!.search!.targets;

  it('registrar um objeto liga o relógio e não duplica', () => {
    const a = registerFind(EMPTY_SEARCH, targets, 'chave', 1000);
    expect(a.isNew).toBe(true);
    expect(a.progress.startedAt).toBe(1000);
    const b = registerFind(a.progress, targets, 'chave', 2000);
    expect(b.isNew).toBe(false);
    expect(b.progress).toBe(a.progress);
  });

  it('objeto que não é alvo da cena é ignorado', () => {
    expect(registerFind(EMPTY_SEARCH, targets, 'lupa', 0).isNew).toBe(false);
  });

  it('objeto achado na busca 2D conta no 3D (e vice-versa)', () => {
    const from2d = { ...EMPTY_SEARCH, found: ['chave'], startedAt: 0 };
    expect(registerFind(from2d, targets, 'chave', 10).isNew).toBe(false);
  });

  it('o oitavo objeto conclui a cena com a pontuação do 3D', () => {
    let last = registerFind(beginSearch(EMPTY_SEARCH, 0), targets, targets[0]!, 0);
    let p = last.progress;
    for (const id of targets.slice(1)) {
      last = registerFind(p, targets, id, 90_000);
      p = last.progress;
    }
    expect(last.completed).toBe(true);
    expect(p.found).toHaveLength(8);
    expect(p.completedIn).toBe('3d');
    expect(p.elapsedMs).toBe(90_000);
    expect(progressScore(p)).toBe(820);
    expect(p.bestStars).toBe(5);
  });

  it('o recorde de estrelas nunca diminui', () => {
    // Uma partida lenta (10 min de tempo ativo) depois de um recorde de 5 estrelas.
    let p: typeof EMPTY_SEARCH = { ...beginSearch(EMPTY_SEARCH, 0), bestStars: 5 };
    for (const id of targets) p = registerFind(p, targets, id, 600_000).progress;
    expect(p.bestStars).toBe(5);
    expect(searchStars(progressScore(p))).toBe(1);
  });

  it('beginSearch não reinicia um relógio ligado nem uma cena concluída', () => {
    const running = { ...EMPTY_SEARCH, startedAt: 5 };
    expect(beginSearch(running, 99)).toBe(running);
    const done = { ...EMPTY_SEARCH, startedAt: 5, elapsedMs: 10 };
    expect(beginSearch(done, 99)).toBe(done);
  });

  it('saves antigos, sem completedIn, continuam pontuando pela fórmula 2D', () => {
    const old = { ...EMPTY_SEARCH, elapsedMs: 20_000, misclicks: 1, hints: 0 };
    expect(progressScore(old)).toBe(searchScore(20, 1, 0));
  });

  it('evidências do rancho só aparecem com a cena concluída', () => {
    const s = initialState(rojas1892.id);
    expect(unlockedEvidence(rojas1892, s).map((e) => e.id)).toEqual([]);
    const done = { ...s, search: { rancho: { ...EMPTY_SEARCH, elapsedMs: 1 } } };
    expect(unlockedEvidence(rojas1892, done).map((e) => e.id)).toEqual(['cena', 'mancha']);
  });
});

describe('relógio da busca: só conta tempo ativo', () => {
  const targets = rojas1892.locations.find((l) => l.id === 'rancho')!.search!.targets;

  it('começar liga o relógio; o tempo cresce enquanto roda', () => {
    const p = beginSearch(EMPTY_SEARCH, 1000);
    expect(p.startedAt).toBe(1000);
    expect(isRunning(p)).toBe(true);
    expect(searchElapsed(p, 4000)).toBe(3000);
  });

  it('pausado, o tempo não anda; ao retomar, continua de onde parou', () => {
    let p = beginSearch(EMPTY_SEARCH, 0);
    p = pauseSearch(p, 10_000); // 10 s jogando
    expect(isRunning(p)).toBe(false);
    expect(searchElapsed(p, 3_600_000)).toBe(10_000); // uma hora fora não conta
    p = resumeSearch(p, 3_600_000);
    expect(searchElapsed(p, 3_605_000)).toBe(15_000);
  });

  it('pausar ou retomar duas vezes não muda nada (idempotente)', () => {
    const running = beginSearch(EMPTY_SEARCH, 0);
    expect(resumeSearch(running, 50)).toBe(running);
    const paused = pauseSearch(running, 100);
    expect(pauseSearch(paused, 900)).toBe(paused);
  });

  it('não retoma uma cena que não começou nem uma concluída', () => {
    expect(resumeSearch(EMPTY_SEARCH, 10)).toBe(EMPTY_SEARCH);
    const done = { ...EMPTY_SEARCH, startedAt: 0, elapsedMs: 5000 };
    expect(resumeSearch(done, 10)).toBe(done);
  });

  it('a conclusão usa o tempo ativo, não o horário de início', () => {
    let p = beginSearch(EMPTY_SEARCH, 0);
    for (const id of targets.slice(0, 7)) p = registerFind(p, targets, id, 1000).progress;
    p = pauseSearch(p, 20_000); // 20 s jogando, depois a aba fica escondida por um dia
    p = resumeSearch(p, 86_400_000);
    const last = registerFind(p, targets, targets[7]!, 86_400_000 + 10_000);
    expect(last.completed).toBe(true);
    expect(last.progress.elapsedMs).toBe(30_000);
    expect(isRunning(last.progress)).toBe(false);
  });

  it('save antigo (sem os campos novos) fica pausado com tempo zero, a favor do jogador', () => {
    const legacy = { ...EMPTY_SEARCH, startedAt: 1, found: ['chave'] };
    expect(isRunning(legacy)).toBe(false);
    expect(searchElapsed(legacy, 999_999_999)).toBe(0);
    expect(isRunning(resumeSearch(legacy, 5))).toBe(true);
  });
});
