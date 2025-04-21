import { component$ } from "@builder.io/qwik";
import type { PokemonItem } from "~/model";

interface Props {
  pokemon: PokemonItem;
}

export const PokemonName = component$<Props>(({ pokemon }) => {
  if (!pokemon.formName) return pokemon.name;
  return <>{pokemon.name} - {pokemon.formName}</>
});