import type { PropsOf} from "@builder.io/qwik";
import { component$, useStyles$ } from "@builder.io/qwik";
import type { Evolution } from "~/ci";
import { Anchor } from "../anchor";
import { PokemonImg } from "../img/img";
import style from './evolution.scss?inline';

interface Props extends PropsOf<'div'> {
  evolutions?: (Evolution | null)[][];
}
export const PokemonEvolution = component$<Props>(({ evolutions, ...props }) => {
  useStyles$(style);
  if (!evolutions || evolutions.length === 1) return;
  return (
    <div {...props} data-pokemon-evolution role="table">
      <div role="rowgroup">
        {evolutions.map((row, i) => (
          <div key={i} class="row" role="row">
            {row.map((col, j) => {
              if (!col?.pokemon) return;
              const pokemon = col.pokemon;
              return (
                <div key={i + '-' + j} role="cell">
                  <Anchor href={`../${pokemon.id}`}>
                    <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition/>
                    {pokemon.name}
                  </Anchor>
                </div>
              )
            })}
          </div>
      ))}
      </div>
    </div>
  )
})