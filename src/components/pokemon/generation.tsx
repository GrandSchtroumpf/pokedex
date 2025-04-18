import { component$ } from "@builder.io/qwik";
import { Anchor } from "../anchor";
import { useLocation } from "@builder.io/qwik-city";

interface Props {
  generation?: string;
}

const symbols = {
  'generation-i': '一',
  'generation-ii': '二',
  'generation-iii': '三',
  'generation-iv': '四',
  'generation-v': '五',
  'generation-vi': '六',
  'generation-vii': '七',
  'generation-viii': '八',
  'generation-ix': '九',
}

export const PokemonGeneration = component$<Props>(({ generation }) => {
  const { params } = useLocation();
  if (!generation) return;
  return (
    <Anchor data-pokemon-generation href={`/${params.lang}/${generation}`}>
      {symbols[generation as keyof typeof symbols]}
    </Anchor>
  )
})