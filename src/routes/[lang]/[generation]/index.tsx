import { $, component$, createContextId, isServer, Resource, untrack, useContext, useContextProvider, useSignal, useStyles$, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { generations, langs, types } from "~/data";
import type { Generation, PokemonItem } from "~/model";
import { Logo } from "~/components/logo";
import { Anchor } from "~/components/anchor";
import style from './index.scss?inline';
import { join } from "node:path";
import { cwd } from "node:process";
import { readFile } from "node:fs/promises";
import { PokemonTypes } from "~/components/pokemon/types";

export const useGeneration = routeLoader$(async ({ params }) => {
  const path = join(cwd(), 'public/data', params.lang, 'generations.json');
  const res = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(res) as Generation[];
});
export const usePokemonList = routeLoader$(async ({ params }) => {
  const path = join(cwd(), 'public/data', params.lang, 'generation', `${params.generation}.json`);
  const res = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(res) as PokemonItem[];
});


interface PokemonPage {
  pokemon: PokemonItem;
  eager?: boolean;
}

const PokemonPage = component$<PokemonPage>(({ pokemon, eager }) => {
  const { params } = useLocation();
  const color = types[pokemon.types[0]].color;
  const style = {
    '--hue': color.h,
    '--timeline-name': `--pokemon-${pokemon.id}`,
  }

  const swipe = $((startEvent: TouchEvent) => {
    const start = startEvent.touches[0].clientY;
    let delta = 0;
    const move = (moveEvent: TouchEvent) => {
      delta = start - moveEvent.touches[0].clientY;
    }
    document.addEventListener('touchmove', move)
    document.addEventListener('touchend', () => {
      const ratio =  delta / window.innerHeight;
      if (delta > 0 && ratio > 0.15) {
        location.pathname = `/${params.lang}/pokemon/${pokemon.id}`;
      }
      document.removeEventListener('touchmove', move)
    }, { once: true });
  })


  return <section class="pokemon-page theme" aria-labelledby="pokemon-name" style={style} onTouchStart$={swipe}>
    <article>
      <Anchor href={`/${params.lang}/pokemon/${pokemon.id}`}>
        <PokemonImg class="pokemon-img" pokemon={pokemon} eager={eager} sizes="(max-width: 400px) 200px, 375px" />
      </Anchor>
      <div class="pokemon-profile">          
        <PokemonTypes types={pokemon.types} />
        <h1 class="pokemon-name">{pokemon.name}</h1>
        <h2 class="genus">{pokemon.shape} - {pokemon.genus}</h2>
        <p class="description">{pokemon.flavorText}</p>
        <p class="pokemon-index">#{pokemon.id}</p>
      </div>
    </article>
  </section>
})


const ActiveIdContext = createContextId<Signal<number>>('ActiveIdContext');

const Previous = component$(() => {
  const nav = useNavigate();
  const { url } = useLocation();
  const activeId = useContext(ActiveIdContext);

  const previous = $(() => {
    if (!activeId.value) return;
    url.hash = `pokemon-${activeId.value-1}`;
    nav(url);
  });

  return <button class={['previous']} onClick$={previous} aria-label="Previous pokemon">
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z" fill="currentColor"/>
    </svg>
  </button>
})
const Next = component$(() => {
  const nav = useNavigate();
  const { url } = useLocation();
  const activeId = useContext(ActiveIdContext)

  const next = $(() => {
    url.hash = `pokemon-${activeId.value+1}`;
    nav(url);
  });

  return <button class={['next']} onClick$={next} aria-label="Next pokemon">
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12" fill="currentColor"/>
    </svg>
  </button>
})


interface PokemonNavProps {
  pokemons: PokemonItem[];
}
const PokemonNav = component$(({pokemons}: PokemonNavProps) => {
  const activeId = useContext(ActiveIdContext);
  return <nav class="pokemon-nav" aria-label="Select a pokemon">
    {pokemons.map(p => (
    <a id={`link-${p.id}`} key={p.id} href={`#pokemon-${p.id}`} aria-current={activeId.value === p.id ? 'page' : undefined}>
      {p.name}
    </a>
    ))}
  </nav>
})

const keyframes = (pokemons: PokemonItem[]) => `
  @keyframes pokemon-colors {
    ${pokemons.map((p, i) => `${i / (pokemons.length - 1) * 100}% {background-color: oklch(var(--lum-2) 15% ${p.color.h});}`).join('')}
  }
`;

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const [, initialId = '1'] = untrack(() => url.hash.split('-'));
  const activeId = useSignal(Number(initialId));
  useContextProvider(ActiveIdContext, activeId);

  const pokemonList = usePokemonList();

  useTask$(({ track }) => {
    const id = track(activeId);
    if (isServer) return;
    document.getElementById(`link-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  });
  
  useVisibleTask$(({ cleanup }) => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const [, id] = entry.target.id.split('-');
          activeId.value = Number(id);
        }
      }
    }, { threshold: 0.9 });
    const items = document.querySelectorAll('#pokemon-list > li');
    for (const item of items) {
      observer.observe(item);
    }
    cleanup(() => observer.disconnect());
  });

  return <Resource value={pokemonList} onResolved={(pokemons) => (
    <main id="pokemon-list-page" >
      <header>
        <a href={`/${params.lang}`} class="back" aria-label="Back to pokedex">
          <Logo width="40" height="40"/>
        </a>
        <PokemonNav pokemons={pokemons}/>
      </header>
      <div class="pokemon-carousel">
        <Previous />
        <ul id="pokemon-list" class="main-nav" >
          {pokemons.map((pokemon, i) => (
            <li id={`pokemon-${pokemon.id}`} key={pokemon.id} data-target={activeId.value === pokemon.id}>
              <PokemonPage pokemon={pokemon} eager={i === 0} />
            </li>
          ))}
        </ul>
        <Next />
      </div>
      <style dangerouslySetInnerHTML={keyframes(pokemons)}></style>
    </main>
  )} />
})


export const onStaticGenerate: StaticGenerateHandler = async () => {
  const params: {lang: string, generation: string}[] = [];
  for (const lang of langs) {
    for (const generation of generations) {
      params.push({ lang, generation })
    }
  }
  return { params };
};

// Now we can export a function that returns a DocumentHead object
export const head: DocumentHead = ({ resolveValue, params, url }) => {
  const generations = resolveValue(useGeneration);
  const name = generations.find(({ id }) => id === params.generation)?.name;
  return {
    title: `Pokedex - ${name}`,
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${url.origin}/imgs/logo/original.svg`,
      }
    ],
    meta: [
      {
        name: "description",
        content: `List of the pokemons of ${params.generation}`,
      },
      {
        name: 'language',
        content: params.lang,
      },
      {
        name: 'og:image',
        content: `${url.origin}/imgs/logo/500.jpg`,
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