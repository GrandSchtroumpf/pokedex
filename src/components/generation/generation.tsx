import type { PropsOf} from "@builder.io/qwik";
import { component$, useId, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import type { PokemonItem, Generation } from "~/model";
import { PokemonAnchor } from "../anchor";
import { PokemonImg } from "../img/img";
import style from './generation.scss?inline';

interface Props extends PropsOf<'section'> {
  generation: Generation;
  pokemons: PokemonItem[];
}

export const GenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  useStyles$(style);
  return (
    <section {...props} data-generation-section>
      <h3>{generation.name}</h3>
      <nav style={{'--size': pokemons.length}}>
        {pokemons.map((pokemon) => (
          <PokemonAnchor key={pokemon.id} pokemon={pokemon}>
            <PokemonImg pokemon={pokemon} width="100" height="100" />
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
})

export const LazyGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  useStyles$(style);
  const templateId = useId();
  const targetId = useId();
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const template = document.getElementById(templateId) as HTMLTemplateElement;
    const target = document.getElementById(targetId) as HTMLElement;
    target.insertBefore(template.content, target.lastChild);
  }, { strategy: 'intersection-observer' });
  return (
    <section {...props} data-generation-section>
      <h3>{generation.name}</h3>
      <nav id={targetId} style={{'--size': pokemons.length}}></nav>
      <template id={templateId}>
        {pokemons.map((pokemon) => (
          <PokemonAnchor key={pokemon.id} pokemon={pokemon}>
            <PokemonImg pokemon={pokemon} width="100" height="100" />
          </PokemonAnchor>
        ))}
      </template>
    </section>
  )
});