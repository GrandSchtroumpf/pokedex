import type {
  NamedAPIResource as APIResource,
  Pokemon as APIPokemon,
  PokemonSpecies as APISpecies,
  PokemonShape as APIShape,
  Type as APIType,
  Generation as APIGeneration,
  Language as APILanguage,
  EvolutionChain as APIEvolution,
  EvolutionDetail as APIEvolutionDetail,
  Move as APIMove,
  PokemonForm as APIPokemonForm,
} from 'pokenode-ts';

export { APIPokemon, APIType, APIResource, APISpecies, APIShape, APIGeneration, APILanguage, APIEvolution, APIEvolutionDetail, APIMove, APIPokemonForm };

const baseUrl = `https://pokeapi.co/api/v2`;

interface API {
  language: APILanguage;
  generation: APIGeneration;
  type: APIType;
  pokemon: APIPokemon;
  'pokemon-species': APISpecies;
  'pokemon-shape': APIShape;
  'evolution-chain': APIEvolution;
  move: APIMove;
  'pokemon-form': APIPokemonForm;
}

export type Endpoints = Extract<keyof API, string>;
export type Item<K extends Endpoints> = API[K];


interface ListResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: APIResource[];
}

interface QueryParams {
  limit?: number;
  offset?: number;
}

export async function query<K extends Endpoints>(path: K, params: QueryParams = {}) {
  const url = new URL(`${baseUrl}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url);
  const list = await res.json();
  return list as ListResult;
}

export async function queryAll<K extends Endpoints>(path: K) {
  const { count } = await query(path, { limit: 1 });
  const { results} = await query(path, { limit: count });
  return results as APIResource[];
}

export function get<K extends Endpoints>(url: string): Promise<Item<K>> {
  return fetch(url).then(res => res.json());
}

export async function getAll<K extends Endpoints>(path: K) {
  const list = await queryAll(path);
  const getAllItems = list.map(p => get<K>(p.url));
  return Promise.all(getAllItems);
}