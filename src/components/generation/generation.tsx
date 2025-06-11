import type { PropsOf} from "@qwik.dev/core";
import { component$, useStyles$, $, useSignal, useId, useVisibleTask$, useOn, Slot } from "@qwik.dev/core";
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

export const FirstGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  useStyles$(style);
  const visible = useSignal(false);
  useOn('qvisible', $(() => visible.value = true));
  return (
    <section {...props} data-generation-section>
      <h2 class="page-slide-up">{generation.name}</h2>
      <nav id="first-gen-target" class="page-slide-up" style={{'--size': pokemons.filter(p => !p.formName).length}}>
        {visible.value && <Slot />}
      </nav>
    </section>
  )
});

export const GenerationPokemonList = component$<{ pokemons: PokemonItem[] }>(({ pokemons }) => {
  return (
    <>
      {pokemons.filter(p => !p.formName).map((pokemon, i) => (
        <PokemonAnchor
          key={pokemon.id}
          pokemon={pokemon}
          style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2 }}
          onClick$={beforeNavigate}
        >
          <PokemonImg pokemon={pokemon} width="100" height="100" noViewTransition eager={i < 30} />
        </PokemonAnchor>
      ))}
    </>
  )
})


export const LazyGenerationSection = component$<Props>(({ generation, pokemons, ...props }) => {
  const list = useSignal<PokemonItem[]>([]);
  const max = useSignal(0);
  const { url, params } = useLocation();
  const targetId = useId();

  useVisibleTask$(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/generation/${generation.id}.json`);
    const result: PokemonItem[] = await res.json();
    list.value = result.filter(p => !p.formName);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) max.value = list.value.length;
      else max.value = 0;
    });
    const target = document.getElementById(targetId)!;
    observer.observe(target);
    const timeout = setTimeout(() => {
      target.removeAttribute('data-initial-load');
    }, result.length * 10);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    }
  });

  return (
    <section {...props} data-generation-section id={generation.id}>
      <h2>{generation.name}</h2>
      <nav id={targetId} style={{'--size': pokemons.filter(p => !p.formName).length}} class="page-slide-up" data-initial-load>
        {list.value.slice(0, max.value).map((pokemon) => (
          <PokemonAnchor
            key={pokemon.id}
            pokemon={pokemon}
            
            style={{ '--translate-y': `${Math.random() * 400}px`, '--scale': Math.random() / 2}}
            onClick$={beforeNavigate}
          >
            <PokemonImg
              pokemon={pokemon}
              width="100"
              height="100"
              noViewTransition
              style={{ '--delay': `${Math.random() * 100}ms` }}
              />
          </PokemonAnchor>
        ))}
      </nav>
    </section>
  )
});