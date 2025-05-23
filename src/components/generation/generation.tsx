import type { PropsOf} from "@builder.io/qwik";
import { component$, useId, useStyles$, $, useSignal, useOn } from "@builder.io/qwik";
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
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
})

export const LazyGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  const list = useSignal<PokemonItem[]>([]);
  const { url, params } = useLocation();
  const targetId = useId();
  useOn('qvisible', $(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/generation/${generation.id}.json`);
    list.value = await res.json();
  }));
  return (
    <section {...props} data-generation-section>
      <h2>{generation.name}</h2>
      <nav id={targetId} style={{'--size': pokemons.filter(p => !p.formName).length}}>
        {list.value.filter(p => !p.formName).map((pokemon) => (
          <PokemonAnchor
            key={pokemon.id}
            pokemon={pokemon}
            style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2}}
            onClick$={beforeNavigate}
          >
            <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition />
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
});