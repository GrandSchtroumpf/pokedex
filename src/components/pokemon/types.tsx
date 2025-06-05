import type { PropsOf } from '@qwik.dev/core';
import { component$, useStyles$ } from '@qwik.dev/core';
import { PokemonTypeIcon } from './type-icon';
import type { PokemonType } from '~/model';

interface Props extends PropsOf<'ol'> {
  types: PokemonType[];
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
      {types.map(({ name, id, color }) => (
        <li key={id} class="type-item" title={name} style={{ '--hue': color.h }}>
          <PokemonTypeIcon width="16" height="16" type={id} aria-label={name} />
          {name}
        </li>
      ))}
    </ol>
  )
})
