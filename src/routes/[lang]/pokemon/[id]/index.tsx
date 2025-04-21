import { $, component$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
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
import { Anchor } from "~/components/anchor";
import { PokemonGeneration } from "~/components/pokemon/generation";
import { PokemonVariety } from "~/components/pokemon/variety";
import style from './index.scss?inline';
import { PokemonName } from "~/components/pokemon/name";

export const usePokemon = routeLoader$(async ({ params }) => {
  const path = join(cwd(), 'public/data', params.lang, 'pokemon', `${params.id}.json`);
  const text = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(text) as Pokemon;
});

const Content = component$<{ pokemon: Pokemon }>(({ pokemon }) => {
  const { params } = useLocation();
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
        location.pathname = `/${params.lang}/pokemon/${pokemon.previous.id}`;
      } else if (delta > 0 && ratio > 0.15 && pokemon.next) {
        location.pathname = `/${params.lang}/pokemon/${pokemon.next.id}`;
      }
      document.removeEventListener('touchmove', move)
    }, { once: true });
  })

  return (
    <main id="pokemon-page" class="theme" style={{ '--hue': types[pokemon.types[0]].color.h }}>
      <Anchor class="btn back" href={`/${params.lang}`} aria-label="Home">
        <Logo width="40" height="40" />
      </Anchor>
      <section aria-labelledby="pokemon-name">
        <header>
          {pokemon.previous && (
            <Anchor class="previous" href={`/${params.lang}/pokemon/${pokemon.previous.id}`}>
              <svg aria-label="next" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
              </svg>
              <PokemonImg pokemon={pokemon.previous} width="40" height="40"/>
            </Anchor>
          )}
          {pokemon.next && (
            <Anchor class="next" href={`/${params.lang}/pokemon/${pokemon.next.id}`}>
              <PokemonImg pokemon={pokemon.next} width="40" height="40" />
              <svg aria-label="previous" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
              </svg>
            </Anchor>
          )}
        </header>
        <article onTouchStart$={swipe}>
          <PokemonImg class="pokemon-img" pokemon={pokemon} eager sizes="(max-width: 400px) 300px, 375px" />
          <div class="pokemon-profile">    
            <PokemonTypes types={pokemon.types} />
            <hgroup>
              <PokemonGeneration pokemon={pokemon} />
              <span role="separator">•</span>
              <h1 id="pokemon-name">
                <PokemonName pokemon={pokemon} />
              </h1>
            </hgroup>
            <PokemonVariety pokemon={pokemon} />
            <h2 class="genus">{pokemon.genus}</h2>
            <p class="description">{pokemon.flavorText}</p>
            <p class="pokemon-index">#{pokemon.id}</p>
          </div>
        </article>
        <PokemonStats pokemon={pokemon} />
        <PokemonEvolution evolutions={pokemon.evolution} />
      </section>
    </main>
  )
})

export default component$(() => {
  useStyles$(style);
  const pokemon = usePokemon();

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
  const pokemon = resolveValue(usePokemon);
  return {
    title: `Pokemon - ${pokemon.name}`,
    links: [
      {
        rel: 'icon',
        type: 'image/webp',
        href: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/100w.webp`,
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
        content: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/500w.webp`,
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