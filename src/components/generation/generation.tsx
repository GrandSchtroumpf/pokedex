import type { PropsOf} from "@builder.io/qwik";
import { component$, useId, useStyles$, $, useOn } from "@builder.io/qwik";
import type { PokemonItem, Generation } from "~/model";
import { PokemonAnchor } from "../anchor";
import { PokemonImg } from "../img/img";
import { useLocation } from "@builder.io/qwik-city";
import style from './generation.scss?inline';

interface Props extends PropsOf<'section'> {
  generation: Generation;
  pokemons: PokemonItem[];
}

const beforeNavigate = $((event: Event, el: HTMLElement) => {
  const img = (el.firstElementChild as HTMLElement);
  img.style.viewTransitionName = img.dataset.viewTransitionName!;
});

export const GenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  useStyles$(style);
  return (
    <section {...props} data-generation-section>
      <h2>{generation.name}</h2>
      <nav style={{'--size': pokemons.filter(p => !p.formName).length}}>
        {pokemons.filter(p => !p.formName).map((pokemon) => (
          <PokemonAnchor
            key={pokemon.id}
            pokemon={pokemon}
            style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2}}
            onClick$={beforeNavigate}
          >
            <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition />
            {pokemon.formName}
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
})

export const LazyGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  useStyles$(style);
  const { url, params } = useLocation();
  const templateId = useId();
  const targetId = useId();
  const baseUrl = `${url.origin}/${params.lang}/pokemon`;
  useOn('qvisible', $(() => {
    const template = document.getElementById(templateId) as HTMLTemplateElement;
    const target = document.getElementById(targetId) as HTMLElement;
    target.insertBefore(template.content, target.lastChild);
  }));
  return (
    <section {...props} data-generation-section>
      <h2>{generation.name}</h2>
      <nav id={targetId} style={{'--size': pokemons.filter(p => !p.formName).length}}></nav>
      <template id={templateId}>
        {/** Try to understand why it's not working */}
        {pokemons.filter(p => !p.formName).map((pokemon) => (
          <a
            key={pokemon.id}
            href={`${baseUrl}/${pokemon.id}`}
            style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2}}
            onClick$={beforeNavigate}
          >
            <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition />
          </a>
        ))}
      </template>
    </section>
  )
});