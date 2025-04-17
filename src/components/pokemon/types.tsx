import type { PropsOf } from '@builder.io/qwik';
import { component$, useStyles$ } from '@builder.io/qwik';
import { types as typeRecord } from '~/data';
import type { TypeName } from '~/model';

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
      border-radius: 4px;
      padding: calc(var(--size, 8px) / 2) var(--size, 8px);
      color: white;
      text-transform: uppercase;
      background-color: oklch(var(--color-lightness) var(--color-chroma) var(--hue));
      color: oklch(var(--on-color-lightness) 0% var(--hue));
    }
  `)
  return (
    <ol {...props} data-pokemon-types>
      {types.map(type => (
        <li key={type} class="type-item" title={type} style={{ '--hue': typeRecord[type].color.h }}>
          {type}
        </li>
      ))}
    </ol>
  )
})
