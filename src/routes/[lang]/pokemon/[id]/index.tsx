import { $, component$, useOnDocument, useSignal, useStyles$, useTask$ } from "@qwik.dev/core";
import type { DocumentHead, StaticGenerateHandler} from "@qwik.dev/router";
import { routeLoader$, useLocation, useNavigate } from "@qwik.dev/router";
import { PokemonImg } from "~/components/img/img";
import type { Pokemon } from "~/model/pokemon";
import { langs, types } from '~/data';
import { PokemonStats } from "~/components/pokemon/stats";
import { Logo } from "~/components/logo";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { join } from "node:path";
import { PokemonEvolution } from "~/components/pokemon/evolution";
import { PokemonTypes } from "~/components/pokemon/types";
import { Anchor, PokemonLink } from "~/components/anchor";
import { PokemonGeneration } from "~/components/pokemon/generation";
import { PokemonVariety } from "~/components/pokemon/variety";
import style from './index.scss?inline';

export const useServerPokemon = routeLoader$(async ({ params }) => {
  const path = join(cwd(), 'public/data', params.lang, 'pokemon', `${params.id}.json`);
  const text = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(text) as Pokemon;
});

const Content = component$<{ pokemon: Pokemon }>(({ pokemon }) => {
  const { params } = useLocation();
  const nav = useNavigate();
  useOnDocument('qviewTransition', $((e: CustomEvent<ViewTransition>) => {
    const viewtransition = e.detail;
    viewtransition.types.add('pokemon-page');
  }));

  const swipe = $((startEvent: TouchEvent) => {
    const start = startEvent.touches[0].clientX;
    let delta = 0;
    const move = (moveEvent: TouchEvent) => {
      delta = start - moveEvent.touches[0].clientX;
    }
    document.addEventListener('touchmove', move)
    document.addEventListener('touchend', () => {
      const ratio =  delta / window.innerWidth;
      if (delta < 0 && ratio < -0.15 && pokemon.previous) {
        nav(`/${params.lang}/pokemon/${pokemon.previous.id}`);
      } else if (delta > 0 && ratio > 0.15 && pokemon.next) {
        nav(`/${params.lang}/pokemon/${pokemon.next.id}`);
      }
      document.removeEventListener('touchmove', move)
    }, { once: true });
  })

  return (
    <main id="pokemon-page" class="theme" style={{ '--hue': types[pokemon.types[0].id].color.h }}>
      <Anchor class="btn back" href={`/${params.lang}`} aria-label="Home">
        <Logo width="40" height="40" />
      </Anchor>
      <section aria-labelledby="pokemon-name">
        <header>
          {pokemon.previous && (
            <PokemonLink class="previous" pokemon={pokemon.previous}>
              <svg aria-label="next" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
              </svg>
              <PokemonImg pokemon={pokemon.previous} width="40" height="40"/>
            </PokemonLink>
          )}
          {pokemon.next && (
            <PokemonLink class="next" pokemon={pokemon.next}>
              <PokemonImg pokemon={pokemon.next} width="40" height="40" />
              <svg aria-label="previous" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
              </svg>
            </PokemonLink>
          )}
        </header>
        <article onTouchStart$={swipe} class="page-slide-up">
          <div class="images">
            <PokemonImg class="pokemon-img" pokemon={pokemon} eager sizes="(max-width: 400px) 300px, 375px" />
            <PokemonVariety pokemon={pokemon} class="pokemon-varieties page-slide-up" stoppropagation:touchstart />
          </div>
          <div class="pokemon-profile">    
            <PokemonTypes types={pokemon.types} />
            <hgroup>
              <PokemonGeneration pokemon={pokemon} />
              <span role="separator">•</span>
              <h1 id="pokemon-name">{pokemon.name}</h1>
            </hgroup>
            <h2 class="genus">{pokemon.formName || pokemon.genus}</h2>
            <p class="description">{pokemon.flavorText}</p>
          </div>
          <p class="pokemon-index">#{pokemon.id}</p>
        </article>
        <PokemonStats pokemon={pokemon} />
        <PokemonEvolution evolutions={pokemon.evolution}  class="page-slide-up"/>
      </section>
    </main>
  )
})

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const pokemon = useSignal<Pokemon>();
  useTask$(async ({ track }) => {
    track(() => params.id);
    const path = `${url.origin}/data/${params.lang}/pokemon/${params.id}.json`;
    const res = await fetch(path);
    pokemon.value = await res.json();
  })
  if (!pokemon.value) return;
  return <Content pokemon={pokemon.value} />
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const params: {lang: string, id: string}[] = [];
  for (const lang of langs) {
    // Pokemons
    for (let i = 1; i <= 1025; i++) {
      params.push({ lang, id: i.toString() })
    }
    // Forms
    for (let i = 10_001; i <= 10_277; i++) {
      params.push({ lang, id: i.toString() })
    }
  }
  return { params };
};

 
// Now we can export a function that returns a DocumentHead object
export const head: DocumentHead = ({ resolveValue, params, url }) => {
  const pokemon = resolveValue(useServerPokemon);
  return {
    title: `Pokemon - ${pokemon.name}`,
    links: [
      {
        rel: 'icon',
        type: 'image/avif',
        href: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/100w.avif`,
      }
    ],
    meta: [
      {
        name: 'language',
        content: params.lang,
      },
      {
        name: 'description',
        content: pokemon.flavorText,
      },
      {
        name: 'id',
        content: pokemon.id.toString(),
      },
      {
        name: 'og:url',
        content: `${url.origin}/${params.lang}/pokemon/${pokemon.id}`,
      },
      {
        name: 'og:image',
        content: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/500w.avif`,
      },
      {
        name: 'og:image:width',
        content: '500',
      },
      {
        name: 'og:image:height',
        content: '500',
      },
    ],
  };
};