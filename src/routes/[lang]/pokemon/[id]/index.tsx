import { component$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { PokemonImg } from "~/components/img/img";
import { Back } from "~/components/back";
import type { TypeName } from "~/model/type";
import type { Pokemon } from "~/model/pokemon";
import { langs, pokemons, types } from '~/data';
import { cssColor } from "~/components/color";
import { PokemonStats } from "~/components/pokemon/stats";
import { Logo } from "~/components/logo";
import style from './index.scss?inline';

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

export const usePokemon = routeLoader$(async (requestEvent) => {
  const { url, params } = requestEvent;
  const res = await fetch(`${url.origin}/data/${params.lang}/pokemon/${params.id}.json`);
  return res.json() as Promise<Pokemon>;
});

const Content = component$<{ pokemon: Pokemon }>(({ pokemon }) => {
  const { params } = useLocation();
  return (
    <main id="pokemon-page" style={cssColor(types[pokemon.types[0]].color)}>
      <Back class="btn back" href={`/${params.lang}`}>
        <Logo width="24" height="24" />
        <span>Pokedex</span>
      </Back>
      <section aria-labelledby="pokemon-name">
        <header>
          {pokemon.previous && (
            <a class="previous" href={`/${params.lang}/pokemon/${pokemon.previous.id}`}>
              <PokemonImg pokemon={pokemon.previous} width="40" height="40"/>
              {pokemon.previous.name}
            </a>
          )}
          {pokemon.next && (
            <a class="next" href={`/${params.lang}/pokemon/${pokemon.next.id}`}>
              <PokemonImg pokemon={pokemon.next} width="40" height="40" />
              {pokemon.next.name}
            </a>
          )}
        </header>
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
  )
})

export default component$(() => {
  useStyles$(style);
  const pokemon = usePokemon();
  return <Content pokemon={pokemon.value} />
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
        href: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/100w.webp`,
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
        content: `${url.origin}/imgs/pokemon/${pokemon.imgName.toLowerCase()}/500w.webp`,
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