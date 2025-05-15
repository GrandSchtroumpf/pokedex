import type { PropsOf} from "@builder.io/qwik";
import { component$, useStyles$ } from "@builder.io/qwik";
import type { Evolution, EvolutionDetails } from "~/ci";
import { PokemonAnchor } from "../anchor";
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
                    <PokemonAnchor pokemon={pokemon}>
                      <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition/>
                      {pokemon.name}
                    </PokemonAnchor>
                    <PokemonEvolutionDetails details={col.details} />
                  </div>
                )
              })}
            </div>
        ))}
      </div>
    </div>
  )
})

const paths: Record<EvolutionDetails['trigger'], string> = {
  "level-up": 'm296-105-56-56 240-240 240 240-56 56-184-183-184 183Zm0-240-56-56 240-240 240 240-56 56-184-183-184 183Zm0-240-56-56 240-240 240 240-56 56-184-183-184 183Z',
  "trade": 'M280-160 80-360l200-200 56 57-103 103h287v80H233l103 103-56 57Zm400-240-56-57 103-103H440v-80h287L624-743l56-57 200 200-200 200Z',
  "use-item": 'M480-80 120-280v-400l360-200 360 200v400L480-80ZM364-590q23-24 53-37t63-13q33 0 63 13t53 37l120-67-236-131-236 131 120 67Zm76 396v-131q-54-14-87-57t-33-98q0-11 1-20.5t4-19.5l-125-70v263l240 133Zm40-206q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400Zm40 206 240-133v-263l-125 70q3 10 4 19.5t1 20.5q0 55-33 98t-87 57v131Z',
  "shed": 'M440-160v-304L240-664v104h-80v-240h240v80H296l224 224v336h-80Zm154-376-58-58 128-126H560v-80h240v240h-80v-104L594-536Z',
  "spin": 'm360-160-56-56 70-72q-128-17-211-70T80-480q0-83 115.5-141.5T480-680q169 0 284.5 58.5T880-480q0 62-66.5 111T640-296v-82q77-20 118.5-49.5T800-480q0-32-85.5-76T480-600q-149 0-234.5 44T160-480q0 24 51 57.5T356-372l-52-52 56-56 160 160-160 160Z',
  "tower-of-darkness": '',
  "tower-of-waters": '',
  "three-critical-hits": '',
  "take-damage": '',
  "other": '',
  "agile-style-move": '',
  "strong-style-move": '',
  "recoil-damage": '',
}
const PokemonEvolutionDetails = component$<{ details: EvolutionDetails[] }>(({ details }) => {
  return (
    <ul class="evolution-details">
      {details.map((detail, i) => (
        <li key={i}>
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 -960 960 960" fill="currentColor">
            <path d={paths[detail.trigger]}/>
          </svg>
          {detail.value}
        </li>
      ))}
    </ul>
  )
})