import { $, component$, createContextId, isServer, Resource, untrack, useContext, useContextProvider, useSignal, useStyles$, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { Link, routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { cssColor } from "~/components/color";
import { generations, langs, types } from "~/data";
import type { Generation, PokemonItem, TypeName } from "~/model";
import { usePokemonGeneration } from "~/hooks/useData";
import { LangPicker } from "~/components/lang-picker/lang-picker";
import style from './index.scss?inline';

interface TypeItemProps {
  name: TypeName;
}
const TypeItem = component$(({ name }: TypeItemProps) => {
  const type = types[name];
  const { l, c, h } = type.color;
  return <li class="type-item" title={name} style={`background-color: oklch(${l} ${c} ${h})`}>
    {name}
  </li>
})

// TODO: url this with MPA
export const useGeneration = routeLoader$(async (requestEvent) => {
  const { url, params } = requestEvent;
  const res = await fetch(`${url.origin}/data/${params.lang}/generation/${params.generation}.json`);
  return res.json() as Promise<Generation>;
});


interface PokemonPage {
  pokemon: PokemonItem;
  eager?: boolean;
}

const PokemonPage = component$<PokemonPage>(({ pokemon, eager }) => {
  const color = types[pokemon.types[0]].color;
  const style = [
    cssColor(color),
    `--timeline-name: --pokemon-${pokemon.id}`
  ].join(';');

  return <section class="pokemon-page" aria-labelledby="pokemon-name" style={style}>
    <article>
      <PokemonImg class="pokemon-img" pokemon={pokemon} eager={eager}/>
      <div class="pokemon-profile">          
        <ol class="type-list">
          {pokemon.types.map(type => (
          <TypeItem key={type} name={type}/>
          ))}
        </ol>
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

  return <button class={['previous']} onClick$={previous}>
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/>
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

  return <button class={['next']} onClick$={next}>
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12"/>
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
    <Link id={`link-${p.id}`} key={p.id} href={`#pokemon-${p.id}`} aria-current={activeId.value === p.id ? 'page' : undefined}>
      {p.name}
    </Link>
    ))}
  </nav>
})

const keyframes = (pokemons: PokemonItem[]) => `
  @keyframes pokemon-colors {
    ${pokemons.map((p, i) => `${i / (pokemons.length - 1) * 100}% { background-color: oklch(25% 15% ${p.color.h});}`).join('')}
  }
`;

export default component$(() => {
  useStyles$(style);
  const { url } = useLocation();
  const [, initialId = '1'] = untrack(() => url.hash.split('-'));
  const activeId = useSignal(Number(initialId));
  useContextProvider(ActiveIdContext, activeId);

  const pokemonResource = usePokemonGeneration();

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

  return <Resource value={pokemonResource} onResolved={(pokemons) => (
    <>
    <main id="pokemon-list-page" >
      <header>
        <Link href=".." class="back">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
        </Link>
        <PokemonNav pokemons={pokemons}/>
        <LangPicker />
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
    </>
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
  const generation = resolveValue(useGeneration);
  return {
    title: `Pokedex - ${generation.name}`,
    links: [
      {
        rel: 'icon',
        type: 'image/png',
        href: `${url.origin}/imgs/logo.png`,
      }
    ],
    meta: [
      {
        name: 'language',
        content: params.lang,
      },
    ],
  };
};