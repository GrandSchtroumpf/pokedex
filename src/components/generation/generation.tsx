import type { PropsOf} from "@qwik.dev/core";
import { component$, useStyles$, $, useSignal, useOn } from "@qwik.dev/core";
import type { PokemonItem, Generation } from "~/model";
import { PokemonAnchor } from "../anchor";
import { PokemonImg } from "../img/img";
import { useLocation } from "@qwik.dev/router";
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
      <h2 class="page-slide-up">{generation.name}</h2>
      <nav style={{'--size': pokemons.filter(p => !p.formName).length}}>
        {pokemons.filter(p => !p.formName).map((pokemon, i) => (
          <PokemonAnchor
            key={pokemon.id}
            pokemon={pokemon}
            class="page-slide-up"
            style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2 }}
            onClick$={beforeNavigate}
          >
            <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition eager={i < 30} />
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
})

export const LazyGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  const list = useSignal<PokemonItem[]>([]);
  const { url, params } = useLocation();
  useOn('qvisible', $(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/generation/${generation.id}.json`);
    const result: PokemonItem[] = await res.json();
    list.value = result.filter(p => !p.formName);
  }));
  return (
    <section {...props} data-generation-section id={generation.id}>
      <h2>{generation.name}</h2>
      <nav style={{'--size': pokemons.filter(p => !p.formName).length}}>
        {list.value.map((pokemon) => (
          <PokemonAnchor
            key={pokemon.id}
            pokemon={pokemon}
            class="page-slide-up"
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