import { component$, Resource, useResource$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
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
});

// TODO: url this with MPA
export const usePokemon = routeLoader$(async (requestEvent) => {
  const { url, params } = requestEvent;
  const res = await fetch(`${url.origin}/data/${params.lang}/pokemon/${params.id}.json`);
  return res.json() as Promise<Pokemon>;
});

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const pokemonResource = useResource$<Pokemon>(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/pokemon/${params.id}.json`);
    return res.json();
  });

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

 
// Now we can export a function that returns a DocumentHead object
export const head: DocumentHead = ({ resolveValue, params, url }) => {
  const pokemon = resolveValue(usePokemon);
  return {
    title: `Pokemon - ${pokemon.name}`,
    links: [
      {
        rel: 'icon',
        type: 'image/webp',
        href: `${url.origin}/imgs/pokemon/${pokemon.name}/100w.webp`,
      }
    ],
    meta: [
      {
        name: 'language',
        content: params.lang,
      },
      {
        name: 'description',
        content: pokemon.flavorText,
      },
      {
        name: 'id',
        content: pokemon.id.toString(),
      },
      {
        name: 'og:url',
        content: `${url.origin}/${params.lang}/pokemon/${pokemon.id}`,
      },
      {
        name: 'og:image',
        content: `${url.origin}/imgs/pokemon/${pokemon.name}/500w.webp`,
      },
      {
        name: 'og:image:width',
        content: '500',
      },
      {
        name: 'og:image:height',
        content: '500',
      },
    ],
  };
};