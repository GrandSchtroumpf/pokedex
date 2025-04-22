import { component$, PropsOf } from "@builder.io/qwik";
import type { Pokemon } from "~/model"
import { PokemonImg } from "../img/img";
import { PokemonAnchor } from "../anchor";

interface Props extends PropsOf<'nav'> {
  pokemon: Pokemon;
}

export const PokemonVariety = component$<Props>(({ pokemon, ...props }) => {
  if (!pokemon.varieties.length) return;
  return (
    <nav {...props} aria-label="Varieties of this pokemon" data-pokemon-variety>
      {pokemon.varieties.map((item) => {
        if (item.id === pokemon.id) return;
        return (
          <PokemonAnchor pokemon={item} key={item.id}>
            <PokemonImg pokemon={item} width="60" height="60" noViewTransition={pokemon.varieties.length > 5} />
          </PokemonAnchor>
        )})}
    </nav>
  )
})