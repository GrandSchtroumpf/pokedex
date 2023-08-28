import { Slot, component$, createContextId, useContextProvider, useSignal } from "@builder.io/qwik";
import type { Signal} from "@builder.io/qwik";
import type { Pokemon } from '~/model/pokemon';
import pokemonList from '~/data/pokemon.json';


export const ViewTransitionContext = createContextId<Signal<string>>('ViewTransitionContext');

export const pokemons = pokemonList as Pokemon[];

export default component$(() => {
  const viewTransitionNames = useSignal('');
  useContextProvider(ViewTransitionContext, viewTransitionNames);
  return <>
    <style dangerouslySetInnerHTML={viewTransitionNames.value}></style>
    <Slot/>
  </>
})