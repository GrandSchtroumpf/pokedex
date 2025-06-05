import type { QwikJSX} from '@qwik.dev/core';
import { component$ } from '@qwik.dev/core';
import type { PokemonItem } from '~/model/pokemon';

type Attributes<T extends keyof QwikJSX.IntrinsicElements> = QwikJSX.IntrinsicElements[T];

interface PokemonImgProps extends Attributes<'img'> {
  pokemon: PokemonItem;
  eager?: boolean;
  noViewTransition?: boolean;
}

const pokemonSizes = [50, 100, 200, 300, 600, 750];
export const PokemonImg = component$(({ pokemon, eager, noViewTransition, ...props }: PokemonImgProps) => {
  const {name, imgName} = pokemon;
  const src = `/imgs/pokemon/${imgName}/original.avif`;
  const srcset = pokemonSizes.map(size => `/imgs/pokemon/${imgName}/${size}w.avif ${size}w`).join(', ');
  const optimization = {
    decoding: eager ? 'sync' : 'async',
    fetchpriority: eager ? 'high' : 'low',
    loading: eager ? 'eager' : 'lazy',
  } as const;
  
  const style = noViewTransition ? {} : { viewTransitionName: `--${imgName}-img--`, ['viewTransitionClass' as any]: 'pokemon-img' }

  return <img
    title={name}
    src={src}
    srcset={srcset}
    alt={name}
    width={150}
    height={150}
    sizes={props.width ? `${props.width}px` : undefined}
    style={style}
    {...optimization}
    {...props}
    data-pokemon-img
    data-view-transition-name={`--${imgName}-img--`}
  />;
})