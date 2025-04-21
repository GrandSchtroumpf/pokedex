import { component$, useStyles$ } from "@builder.io/qwik";
import type { Pokemon } from "~/model"
import { PokemonImg } from "../img/img";
import { PokemonAnchor } from "../anchor";

interface Props {
  pokemon: Pokemon;
}

export const PokemonVariety = component$<Props>(({ pokemon }) => {
  useStyles$(`
    [data-pokemon-variety] {
      display: flex;
      gap: 8px;
    }
  `)
  if (!pokemon.varieties.length) return;
  return (
    <nav aria-label="Varieties of this pokemon" data-pokemon-variety>
      {pokemon.varieties.map((item) => {
        if (item.id === pokemon.id) return;
        return (
          <PokemonAnchor pokemon={item} key={item.id}>
            <PokemonImg pokemon={item} width="60" height="60" noViewTransition={item.id === pokemon.id} />
          </PokemonAnchor>
        )})}
    </nav>
  )
})