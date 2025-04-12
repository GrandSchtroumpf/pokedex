import { component$, useContext, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import type { StaticGenerateHandler} from "@builder.io/qwik-city";
import { Link, useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { ViewTransitionContext } from "../layout";
import { Back } from "~/components/back";
import type { TypeName } from "~/model/type";
import type { Pokemon } from "~/model/pokemon";
import { langs, pokemons, types } from '~/data';
import { cssColor } from "~/components/color";
import style from './index.scss?inline';
import { Meter } from "~/components/meter/meter";

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
  const transitionNames = useContext(ViewTransitionContext);
  const { params } = useLocation();
  const pokemon = (pokemons as Pokemon[]).find(p => p.id.toString() === params.id);
  if (!pokemon) return <Link href=".."> [Back] No pokemon found</Link>;

  const mainType = types[pokemon.types[0]];

  // Clear animation state
  useVisibleTask$(() => {
    transitionNames.value = '';
  })

  return <main id="pokemon-page" style={cssColor(mainType.color)}>
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
      <article id="pokemon-stats">
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
  </main>
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const params: {lang: string, id: string}[] = [];
  for (const lang of langs) {
    for (const pokemon of pokemons) {
      params.push({ lang, id: pokemon.id.toString() })
    }
  }
  return { params };
};