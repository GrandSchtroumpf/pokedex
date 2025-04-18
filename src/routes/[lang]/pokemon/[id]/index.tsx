import { $, component$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import type { Pokemon } from "~/model/pokemon";
import { langs, pokemons, types } from '~/data';
import { PokemonStats } from "~/components/pokemon/stats";
import { Logo } from "~/components/logo";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { join } from "node:path";
import { PokemonEvolution } from "~/components/pokemon/evolution";
import { PokemonTypes } from "~/components/pokemon/types";
import { Anchor } from "~/components/anchor";
import style from './index.scss?inline';

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
              <PokemonImg pokemon={pokemon.previous} width="40" height="40"/>
              {pokemon.previous.name}
            </Anchor>
          )}
          {pokemon.next && (
            <Anchor class="next" href={`/${params.lang}/pokemon/${pokemon.next.id}`}>
              <PokemonImg pokemon={pokemon.next} width="40" height="40" />
              {pokemon.next.name}
            </Anchor>
          )}
        </header>
        <article onTouchStart$={swipe}>
          <PokemonImg pokemon={pokemon} eager />
          <div class="pokemon-profile">          
            <PokemonTypes types={pokemon.types} />
            <h1 id="pokemon-name">{pokemon.name}</h1>
            <h2 class="genus">{pokemon.shape} - {pokemon.genus}</h2>
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
    for (const id of pokemons) {
      params.push({ lang, id: id.toString() })
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