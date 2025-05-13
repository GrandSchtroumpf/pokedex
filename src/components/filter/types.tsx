import type { PropsOf, QRL } from "@builder.io/qwik";
import { $, component$, useStyles$ } from "@builder.io/qwik";
import type { Type, TypeName } from "~/model";
import { PokemonTypeIcon } from "../pokemon/type-icon";
import style from './type.scss?inline';

interface Props extends Omit<PropsOf<'div'>, 'onChange$'> {
  types: Type[];
  onChange$: QRL<(types: TypeName[]) => void> 
}

export const FilterTypes = component$<Props>(({ types, onChange$, ...props }) => {
  useStyles$(style);
  const check = $((e: Event, el: HTMLElement) => {
    const checked = el.querySelectorAll<HTMLInputElement>('[type="checkbox"]:checked');
    const value = Array.from(checked).map(input => input.value as TypeName);
    onChange$(value)
  });

  return (
    <div {...props} role="group" onChange$={check} data-filter-type>
      {types.map(({ id, name, color }) => (
        <label key={id} for={`filter-type-${id}`} style={{ '--hue': color.h }}>
          <input id={`filter-type-${id}`} type="checkbox" name="type" value={id} />
          <PokemonTypeIcon type={id} width="16" height="16" aria-label={name} />
        </label>
      ))}
    </div>
  )
});
