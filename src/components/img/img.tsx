import type { QwikJSX} from '@builder.io/qwik';
import { component$ } from '@builder.io/qwik';
import type { Pokemon } from '~/model/pokemon';

type Attributes<T extends keyof QwikJSX.IntrinsicElements> = QwikJSX.IntrinsicElements[T];

interface PokemonImgProps extends Attributes<'img'> {
  pokemon: Pokemon;
  eager?: boolean;
}

const pokemonSizes = [100, 250, 500, 750];
export const PokemonImg = component$(({ pokemon, eager, ...props }: PokemonImgProps) => {
  const name = pokemon.name;
  const src = `/imgs/pokemon/${name}/original.webp`;
  const srcset = pokemonSizes.map(size => `/imgs/pokemon/${name}/${size}w.webp ${size}w`).join(', ');
  const optimization = {
    decoding: eager ? 'sync' : 'async',
    fetchpriority: eager ? 'high' : 'low',
    loading: eager ? 'eager' : 'lazy',
  } as const;
  
  return <img
    title={name}
    src={src}
    srcSet={srcset}
    alt={name}
    width={150}
    height={150}
    {...optimization}
    {...props}
  />;
})