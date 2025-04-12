import type { Type } from '~/model';
import pokemonList from './pokemon.json';
import typeRecord from './type.json';
import allGeneration from './generation.json';

export const pokemons = pokemonList as number[];
export const types = typeRecord as Record<string, Type>;
export const generations = allGeneration as string[];
export const langs = [
  "ja-Hrkt",
  // "roomaji",
  "ko",
  "zh-Hant",
  "fr",
  // "de",
  // "es",
  // "it",
  "en",
  // "cs",
  "ja",
  // "zh-Hans",
  // "pt-BR"
];
