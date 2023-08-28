import type { Pokemon, Type } from '~/model';
import pokemonList from './pokemon.json';
import typeRecord from './type.json';

export const pokemons = pokemonList as Pokemon[];
export const types = typeRecord as Record<string, Type>;