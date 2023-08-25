import type { Pokemon as APIPokemon } from 'pokenode-ts';

export { APIPokemon };

const baseUrl = `https://pokeapi.co/api/v2`;

interface API {
  pokemon: {
    list: { name: string, url: string },
    item: APIPokemon
  };
}

export type Endpoints = Extract<keyof API, string>;
export type List<K extends Endpoints> = API[K]['list'];
export type Item<K extends Endpoints> = API[K]['item'];


interface ListResult<K extends Endpoints> {
  count: number;
  next: string | null;
  previous: string | null;
  results: List<K>[];
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
  return list as ListResult<K>;
}

export async function queryAll<K extends Endpoints>(path: K) {
  const { count } = await query(path, { limit: 1 });
  const { results} = await query(path, { limit: count });
  return results as List<K>[];
}

export function get<K extends Endpoints>(url: string): Promise<Item<K>> {
  return fetch(url).then(res => res.json());
}

export async function getAll<K extends Endpoints>(path: K) {
  const list = await queryAll(path);
  const getAllItems = list.map(p => get<K>(p.url));
  return Promise.all(getAllItems);
}