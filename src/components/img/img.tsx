import type { QwikJSX} from '@builder.io/qwik';
import { component$ } from '@builder.io/qwik';
import type { PokemonItem } from '~/model/pokemon';

type Attributes<T extends keyof QwikJSX.IntrinsicElements> = QwikJSX.IntrinsicElements[T];

interface PokemonImgProps extends Attributes<'img'> {
  pokemon: PokemonItem;
  eager?: boolean;
}

const pokemonSizes = [50, 100, 300, 600, 750];
export const PokemonImg = component$(({ pokemon, eager, ...props }: PokemonImgProps) => {
  const {name, imgName} = pokemon;
  const src = `/imgs/pokemon/${imgName}/original.webp`;
  const srcset = pokemonSizes.map(size => `/imgs/pokemon/${imgName}/${size}w.webp ${size}w`).join(', ');
  const optimization = {
    decoding: eager ? 'sync' : 'async',
    fetchpriority: eager ? 'high' : 'low',
    loading: eager ? 'eager' : 'lazy',
  } as const;
  
  return <img
    title={name}
    src={src}
    srcset={srcset}
    alt={name}
    width={150}
    height={150}
    sizes={props.width ? `${props.width}px` : undefined}
    style={{ viewTransitionName: `--${imgName}-img--`, ['viewTransitionClass' as any]: 'pokemon-img' }}
    {...optimization}
    {...props}
  />;
})