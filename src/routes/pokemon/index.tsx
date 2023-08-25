import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/router-head/img/img";
import type { Pokemon } from "~/model/pokemon";

export const usePokemons = routeLoader$(async ({ url }) => {
  const res = await fetch(`${url.origin}/list/pokemon.json`);
  const result = await res.json();
  return result as Pokemon[];
});

export default component$(() => {
  const pokemons = usePokemons();
  return <ul>
    {pokemons.value.map(p => (
      <li key={p.id}>
        <PokemonImg pokemon={p}/>
        <h2>{p.name}</h2>
      </li>
    ))}
  </ul>
})