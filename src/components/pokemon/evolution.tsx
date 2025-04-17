import type { PropsOf} from "@builder.io/qwik";
import { component$, useStyles$ } from "@builder.io/qwik";
import type { Evolution } from "~/ci";
import { Anchor } from "../anchor";
import { PokemonImg } from "../img/img";
import style from './evolution.scss?inline';

interface Props extends PropsOf<'table'> {
  evolutions?: (Evolution | null)[][];
}
export const PokemonEvolution = component$<Props>(({ evolutions, ...props }) => {
  useStyles$(style);
  if (!evolutions || evolutions.length === 1) return;
  return (
    <table {...props} data-pokemon-evolution>
      <tbody>
        {evolutions.map((row, i) => (
          <tr key={i}>
            {row.map((col, j) => {
              if (!col?.pokemon) return;
              let span = 1;
              for (let k = j + 1; k < row.length; k++) {
                if (row[k]) break;
                span++;
              }
              const pokemon = col.pokemon;
              return (
                <td key={i + '-' + j} colSpan={span}>
                  <Anchor href={`../${pokemon.id}`}>
                    <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition/>
                    {pokemon.name}
                  </Anchor>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
})