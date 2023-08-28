import type { QwikJSX} from '@builder.io/qwik';
import { component$ } from '@builder.io/qwik';
import type { Pokemon } from '~/model/pokemon';
import { useTranslate } from '../translate';

type Attributes<T extends keyof QwikJSX.IntrinsicElements> = QwikJSX.IntrinsicElements[T];

interface PokemonImgProps extends Attributes<'img'> {
  pokemon: Pokemon;
  eager?: boolean;
}

const pokemonSizes = [100, 250, 500, 750];
export const PokemonImg = component$(({ pokemon, eager, ...props }: PokemonImgProps) => {
  const t = useTranslate();
  const {name, imgName} = pokemon;
  const pokemonName = t(name);
  const src = `/imgs/pokemon/${imgName}/original.webp`;
  const srcset = pokemonSizes.map(size => `/imgs/pokemon/${imgName}/${size}w.webp ${size}w`).join(', ');
  const optimization = {
    decoding: eager ? 'sync' : 'async',
    fetchpriority: eager ? 'high' : 'low',
    loading: eager ? 'eager' : 'lazy',
  } as const;
  
  return <img
    title={pokemonName}
    src={src}
    srcSet={srcset}
    alt={pokemonName}
    width={150}
    height={150}
    {...optimization}
    {...props}
  />;
})