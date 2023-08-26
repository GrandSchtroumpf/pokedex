import { $, component$, useContext, useStyles$ } from "@builder.io/qwik";
import { PokemonImg } from "~/components/img/img";
import { NavGrid, LinkItem } from 'qwik-hueeye';
import type { Pokemon } from "~/model/pokemon";
import { LoadMore, useComputedList, useListProvider } from "~/components/load-more";
import { ViewTransitionContext } from "./layout";
import pokemons from '~/data/pokemon.json';
import style from './index.css?inline';

const baseTransition = (name: string | undefined, i: number, array: any[]) =>  `
::view-transition-old(${name}):only-child {
  animation: scale-out cubic-bezier(0.7, 0, 0.84, 0) 0.3s ${500 / array.length * i}ms forwards;
}`;
const groupTransition = (pokemon: Pokemon) => `
::view-transition-old(pokemon-${pokemon.id}):only-child {
  animation: scale-in ease-in 0.3s forwards;
}`;

interface PokemonItemProps {
  pokemon: Pokemon;
}
const PokemonItem = component$(({ pokemon }: PokemonItemProps) => {
  const transitionNames = useContext(ViewTransitionContext);
  const viewTransitionName = `pokemon-${pokemon.id}`;
  const props = {
    class: 'item',
    style: `view-transition-name: ${viewTransitionName}`,
  }
  const animate = $((event: any, el: HTMLElement) => {
    if (!('startViewTransition' in document)) return;
    const children = Array.from(el.parentElement?.children ?? []);
    const baseStyle = children
      .filter(child => child.checkVisibility({checkOpacity: true}) && child !== el)
      .map(child => child.computedStyleMap().get('view-transition-name')?.toString())
      .filter(name => !!name && name !== 'none')
      .map(baseTransition);
    const groupStyle = groupTransition(pokemon);
    transitionNames.value = [...baseStyle, groupStyle].join('\n');
  });
  return <>
    <LinkItem href={pokemon.id.toString()} {...props} onClick$={animate}>
      <PokemonImg pokemon={pokemon}/>
      <h2>{pokemon.id} - {pokemon.name}</h2>
    </LinkItem>
  </>
})

export default component$(() => {
  useStyles$(style);
  const list = useListProvider({
    list: pokemons,
    limit: 50,
  });
  const result = useComputedList(list);
  return <main>
    <NavGrid class="grid">
      {result.value.map(p => <PokemonItem key={p.id} pokemon={p}/>)}
      <LoadMore limit={50} q:slot="grid-end"></LoadMore>
    </NavGrid>
  </main>
})