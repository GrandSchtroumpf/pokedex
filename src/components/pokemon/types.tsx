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
    }
  `)
  return (
    <ol {...props} data-pokemon-types>
      {types.map(type => {
        const { l, c, h } = typeRecord[type].color;
        return (
          <li key={type} class="type-item" title={type} style={`background-color: oklch(${l} ${c} ${h})`}>
            {type}
          </li>
        )
      })}
    </ol>
  )
})
