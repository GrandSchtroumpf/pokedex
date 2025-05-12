import type { PropsOf } from '@builder.io/qwik';
import { component$, useStyles$ } from '@builder.io/qwik';
import { types as typeRecord } from '~/data';
import type { TypeName } from '~/model';
import { PokemonTypeIcon } from './type-icon';

interface Props extends PropsOf<'ol'> {
  types: TypeName[];
}

export const PokemonTypes = component$<Props>(({ types, ...props }) => {
  useStyles$(`
    [data-pokemon-types] {
      display: flex;
      gap: 8px;
    }
    [data-pokemon-types] > li {
      padding-inline: 4px;
      border-radius: 4px;
      padding: calc(var(--size, 8px) / 2) var(--size, 8px);
      color: black;
      text-transform: uppercase;
      background-color: oklch(75% 60% var(--hue));
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `)
  return (
    <ol {...props} data-pokemon-types>
      {types.map(type => (
        <li key={type} class="type-item" title={type} style={{ '--hue': typeRecord[type].color.h }}>
          <PokemonTypeIcon width="16" height="16" type={type} />
          {type}
        </li>
      ))}
    </ol>
  )
})
