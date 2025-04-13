import { component$, Resource, useResource$, useStyles$ } from "@builder.io/qwik";
import type { StaticGenerateHandler} from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { Back } from "~/components/back";
import type { TypeName } from "~/model/type";
import type { Pokemon } from "~/model/pokemon";
import { langs, pokemons, types } from '~/data';
import { cssColor } from "~/components/color";
import style from './index.scss?inline';
import { PokemonStats } from "~/components/pokemon/stats";

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

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const pokemonResource = useResource$<Pokemon>(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/pokemon/${params.id}.json`);
    return res.json();
  })

  return <Resource value={pokemonResource} onResolved={(pokemon) => (
    <main id="pokemon-page" style={cssColor(types[pokemon.types[0]].color)}>
      <Back class="btn back" href="../..">Pokedex</Back>
      <section aria-labelledby="pokemon-name">
        <article>
          <PokemonImg pokemon={pokemon} eager />
          <div class="pokemon-profile">          
            <ol class="type-list">
              {pokemon.types.map(type => (
              <TypeItem key={type} name={type}/>
              ))}
            </ol>
            <h1 id="pokemon-name">{pokemon.name}</h1>
            <h2 class="genus">{pokemon.shape} - {pokemon.genus}</h2>
            <p class="description">{pokemon.flavorText}</p>
            <p class="pokemon-index">#{pokemon.id}</p>
          </div>
        </article>
        <PokemonStats pokemon={pokemon} />
      </section>
    </main>
  )} />
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