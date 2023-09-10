import { component$, createContextId, untrack, useContext, useContextProvider, useSignal, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import type { StaticGenerateHandler} from "@builder.io/qwik-city";
import { Link, useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { useTranslate } from "~/components/translate";
import { Meter } from "~/components/meter/meter";
import { cssColor } from "~/components/color";
import { pokemons, types, langs } from "~/data";
import type { Pokemon, TypeName } from "~/model";
import { LoadMore, useComputedList, useList, useListProvider } from "~/components/load-more";
import style from './index.scss?inline';

declare const ScrollTimeline: any;

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


interface PokemonPage {
  pokemon: Pokemon
}

const PokemonPage = component$(({ pokemon }: PokemonPage) => {
  const t = useTranslate();
  const color = types[pokemon.types[0]].color;
  const style = [
    cssColor(color),
    `--timeline-name: --pokemon-${pokemon.id}`
  ].join(';')

  return <section class="pokemon-page" aria-labelledby="pokemon-name" style={style}>
    <article>
      <PokemonImg class="pokemon-img" pokemon={pokemon} eager/>
      <div class="pokemon-profile">          
        <ol class="type-list">
          {pokemon.types.map(type => (
          <TypeItem key={type} name={type}/>
          ))}
        </ol>
        <h1 class="pokemon-name">{t(pokemon.name)}</h1>
        <h2 class="genus">{t(pokemon.shape)} - {t(pokemon.genus)}</h2>
        <p class="description">{t(pokemon.flavorText)}</p>
        <p class="pokemon-index">#{pokemon.id}</p>
      </div>
    </article>
    <article class="pokemon-stats">
      <h2>Stats</h2>
      <ul class="stats">
        {Object.entries(pokemon.stats).map(([key, stat]) => (
        <li key={key}>
          <span>{key}</span>
          <Meter max={255} value={stat.value} />
          <span>{stat.value}</span>
        </li>
        ))}
      </ul>
    </article>
  </section>
})


const ActiveIdContext = createContextId<Signal<number>>('ActiveIdContext');

const Previous = component$(() => {
  const activeId = useContext(ActiveIdContext);
  if (activeId.value === 1) return <></>;
  const disabled = activeId.value === 1 ? 'disabled' : '';

  return <Link class={['previous', disabled]} href={`#pokemon-${activeId.value - 1}`}>
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/>
    </svg>
  </Link>
})
const Next = component$(() => {
  const activeId = useContext(ActiveIdContext);
  const { offset, limit } = useList();
  const disabled = activeId.value === offset + limit ? 'disabled' : '';

  return <Link class={['next', disabled]} href={`#pokemon-${activeId.value + 1}`}>
    <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
      <polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12"/>
    </svg>
  </Link>
})


interface PokemonNavProps {
  pokemons: Pokemon[];
}
const PokemonNav = component$(({pokemons}: PokemonNavProps) => {
  const t = useTranslate();
  const activeId = useContext(ActiveIdContext);
  return <nav class="pokemon-nav" aria-label="Select a pokemon">
    {pokemons.map(p => (
    <Link id={`link-${p.id}`} key={p.id} href={`#pokemon-${p.id}`} aria-current={activeId.value === p.id ? 'page' : undefined}>
      {t(p.name)}
    </Link>
    ))}
  </nav>
})


export default component$(() => {
  useStyles$(style);
  const { url } = useLocation();
  const [, initialId = '1'] = untrack(() => url.hash.split('-'));
  const activeId = useSignal(Number(initialId));
  useContextProvider(ActiveIdContext, activeId);

  const listState = useListProvider({
    list: pokemons,
    limit: 50,
  });
  const result = useComputedList(listState);

  // On Active changes
  useVisibleTask$(({ track }) => {
    const id = track(() => activeId.value);
    const child = document.getElementById(`link-${id}`)!;
    const parent = child.parentElement!;
    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const left = childRect.left  + parent.scrollLeft - (parentRect.width - childRect.width) / 2;
    parent.scrollTo({
      behavior: 'smooth',
      left,
    });
  }, { strategy: 'document-ready' })

  // On List Changes
  useVisibleTask$(({ track, cleanup }) => {
    const change = track(() => result.value);
    const list = document.getElementById('pokemon-list')!;
    const [, id] = location.hash.split('-');
    if (id) activeId.value = Number(id);
    // Observer
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const [, id] = entry.target.id.split('-');
          if (!id) continue;
          const ratio = Math.round(entry.intersectionRatio * 100);

          // Update active pokemon
          if (ratio === 100) {
            activeId.value = Number(id);
          }

          // Fallback: Animate background if no scroll timeline available
          if (ratio > 10 && ratio < 30) {
            if (typeof ScrollTimeline === 'undefined') {
              const current = listState.list[activeId.value - 1];
              const next = listState.list[Number(id) - 1];
              document.documentElement.animate([{
                backgroundColor: `oklch(0.2 0.15 ${types[current.types[0]].color.h})`
              },{
                backgroundColor: `oklch(0.2 0.15 ${types[next.types[0]].color.h})`
              }], { duration: 500, fill: 'both' });
            }
          }
        }
      }
    }, {
      threshold: [0.2, 1],
      root: list
    });
    const children = list.children;
    for (const child of children) {
      observer.observe(child);
    }
    cleanup(() => observer.disconnect());
    // Timeline
    if (typeof ScrollTimeline !== 'undefined') {
      const timeline = new ScrollTimeline({
        source: list,
        axis: 'inline'
      });
      const keyframes = change.map(p => ({
        backgroundColor: `oklch(0.2 0.15 ${types[p.types[0]].color.h})`
      }));
      const animation = document.documentElement.animate(keyframes, { timeline } as any);
      cleanup(() => animation.finish());
    }
  }, { strategy: 'document-ready' });

  return <main id="pokemon-list-page" >
    <Previous />
    <PokemonNav pokemons={result.value}/>
    <ul id="pokemon-list" class="main-nav" >
      {result.value.map(pokemon => (
        <li id={`pokemon-${pokemon.id}`} key={pokemon.id} >
        <PokemonPage pokemon={pokemon} />
      </li>
      ))}
      <LoadMore limit={50}></LoadMore>
    </ul>
    <Next />
  </main>
})


export const onStaticGenerate: StaticGenerateHandler = async () => {
  return {
    params: langs.map((lang) => ({ lang })),
  };
};