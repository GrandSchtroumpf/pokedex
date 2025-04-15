import { component$, useComputed$ } from "@builder.io/qwik";
import { Evolution } from "~/ci";

interface Props {
  evolution: Evolution;
}

const getMax = (evolution: Evolution): number => {
  if (!evolution.next.length) return 1;
  return Math.max(getMax(evolution), evolution.next.length)
}

// TODO: return evolution as a table
export const PokemonEvolution = component$<Props>(({ evolution }) => {
  const cols = useComputed$(() => new Array(getMax(evolution)).fill(null));
  return (
    <table>
      {}
    </table>
  )
})