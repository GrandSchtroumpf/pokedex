import type { Signal} from "@builder.io/qwik";
import { component$, createContextId, untrack, useContext, useContextProvider, useSignal, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import { PokemonImg } from "~/components/img/img";
import { useTranslate } from "~/components/translate";
import { pokemons, types } from "~/data";
import type { Pokemon, TypeName } from "~/model";
import { cssColor } from "~/components/color";
import { Link, useLocation } from "@builder.io/qwik-city";
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
      <PokemonImg class="pokemon-img" pokemon={pokemon} />
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
          <progress max={255} value={stat.value}></progress>
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

export default component$(() => {
  useStyles$(style);
  const { url } = useLocation();
  const [, initialId = '1'] = untrack(() => url.hash.split('-'));
  const activeId = useSignal(Number(initialId));
  useContextProvider(ActiveIdContext, activeId);

  const list = useListProvider({
    list: pokemons,
    limit: 50,
  });
  const result = useComputedList(list);
  
  useVisibleTask$(({ track }) => {
    const change = track(() => result.value);
    const timeline = new ScrollTimeline({
      source: document.documentElement,
      axis: 'inline'
    });
    const keyframes = change.map(p => ({
      backgroundColor: `oklch(0.2 0.15 ${types[p.types[0]].color.h})`
    }));
    const animation = document.documentElement.animate(keyframes, { timeline } as any);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const [, id] = entry.target.id.split('-');
          if (id) activeId.value = Number(id);
          location.hash = entry.target.id;
        }
      }
    }, { rootMargin: '0% -50%'});
    const children = document.getElementById('pokemon-list')?.children ?? [];
    for (const child of children) {
      observer.observe(child);
    }
    return () => {
      animation.finish();
      observer.disconnect();
    }
  });

  return <main id="pokemon-list-page" >
    <Previous />
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