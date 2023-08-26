import { component$, useContext, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { ViewTransitionContext } from "../layout";
import { Back } from "~/components/back";
import type { TypeName } from "~/model/type";
import type { Pokemon } from "~/model/pokemon";
import types from '~/data/type.json';
import pokemons from '~/data/pokemon.json';
import style from './index.css?inline';

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
  const cssvar = {
    '--lum': mainType.color.l,
    '--chroma': mainType.color.c,
    '--hue': mainType.color.h,
  } 

  // Clear animation state
  useVisibleTask$(() => {
    transitionNames.value = '';
  })

  return <main id="pokemon-page" style={cssvar}>
    <Back href="..">Back</Back>
    <section aria-labelledby="pokemon-name">
      <PokemonImg pokemon={pokemon} eager />
      <article>
        <h1 id="pokemon-name">{pokemon.name}</h1>
        <ol class="type-list">
          {pokemon.types.map(type => (
          <TypeItem key={type} name={type}/>
          ))}
        </ol>
      </article>
    </section>
    <section>
      <h2></h2>
    </section>
  </main>
})