import { describe, expect, it } from 'vitest';
import { CASES } from '../cases';
import { rojas1892 } from '../cases/rojas1892';
import { HIT_RADIUS, hitTarget, layoutSearch, searchScore, searchStars } from './search';
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
