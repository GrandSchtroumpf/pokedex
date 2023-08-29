import { $, component$, useContext, useStyles$ } from "@builder.io/qwik";
import { PokemonImg } from "~/components/img/img";
import type { Pokemon } from "~/model/pokemon";
import { LoadMore, useComputedList, useListProvider } from "~/components/load-more";
import { ViewTransitionContext } from "./layout";
import { useTranslate } from "~/components/translate";
import { pokemons } from '~/data';
import { cssColor } from "~/components/color";
import { Link } from "@builder.io/qwik-city";
import style from './index.scss?inline';

const mainTransition = `
::view-transition-new(main) {
  animation-delay: 500ms;
}`;
const baseTransition = (name: string | undefined, i: number, array: any[]) =>  `
::view-transition-old(${name}):only-child {
  animation: scale-out cubic-bezier(0.7, 0, 0.84, 0) 0.3s ${500 / array.length * i}ms forwards;
}`;
const groupTransition = (pokemon: Pokemon) => `
::view-transition-old(pokemon-${pokemon.id}):only-child {
  --scale: 2;
  animation:
    scale ease-in 0.3s reverse both,
    fade ease-in 0.3s reverse both;
}`;

interface PokemonItemProps {
  pokemon: Pokemon;
}
const PokemonItem = component$(({ pokemon }: PokemonItemProps) => {
  const t = useTranslate();
  const transitionNames = useContext(ViewTransitionContext);
  const props = {
    class: 'item',
    style: cssColor(pokemon.color),
    'data-name': `pokemon-${pokemon.id}`,
  }
  const animate = $((event: any, el: HTMLElement) => {
    if (!('startViewTransition' in document)) return;
    const children = Array.from(el.parentElement?.children ?? []);
    const items: string[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (!child.checkVisibility({checkOpacity: true})) {
        if (items.length) break;
        continue;
      }
      if (!child.dataset.name) continue;
      child.style.setProperty('view-transition-name', child.dataset.name);
      if (child !== el) items.push(child.dataset.name);
    }
    const baseStyle = items.map(baseTransition);
    const groupStyle = groupTransition(pokemon);
    transitionNames.value = [...baseStyle, groupStyle, mainTransition].join('\n');
  });
  return <>
    <Link href={pokemon.id.toString()} {...props} onClick$={animate}>
      <PokemonImg pokemon={pokemon}/>
      <h2>{pokemon.id} - {t(pokemon.name)}</h2>
    </Link>
  </>
})

export default component$(() => {
  useStyles$(style);
  const list = useListProvider({
    list: pokemons,
    limit: 50,
  });
  const result = useComputedList(list);
  return <main id="pokemon-list">
    <nav class="grid">
      {result.value.map(p => <PokemonItem key={p.id} pokemon={p}/>)}
      <LoadMore limit={50} q:slot="grid-end"></LoadMore>
    </nav>
  </main>
})