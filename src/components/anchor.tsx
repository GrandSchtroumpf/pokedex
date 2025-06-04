import type { PropsOf} from "@builder.io/qwik";
import { $, component$, Slot, useComputed$, useId, useOn } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import type { PokemonItem } from "~/model";

export const Anchor = component$<PropsOf<'a'>>((props) => {
  const { url } = useLocation();
  const id = useId();
  const href = useComputed$(() => {
    if (!props.href) return;
    return new URL(props.href, url).href;
  });

  const prefetch = $(() => {
    if (!props.href || document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'prefetch';
    link.href = props.href;
    document.head.appendChild(link);
  });
  useOn('mouseenter', prefetch);
  useOn('touchstart', prefetch);
  useOn('focus', prefetch);


  return <a {...props} href={href.value}>
    <Slot />
  </a>
});

interface Props extends PropsOf<'a'> {
  pokemon: PokemonItem;
}

export const PokemonAnchor = component$<Props>(({ pokemon, ...props }) => {
  const { url, params } = useLocation();

  const prefetch = $(() => {
    const id = `prefetch-pokemon-${pokemon.id}`;
    if (document.getElementById(id)) return;
    const prefetch = document.createElement('link');
    prefetch.id = id;
    prefetch.rel = 'prefetch';
    prefetch.href = `${url.origin}/${params.lang}/pokemon/${pokemon.id}`;
    document.head.appendChild(prefetch);
    if (pokemon.imgName) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.href = `${url.origin}/imgs/pokemon/${pokemon.imgName}/600w.avif`;
      preload.as = 'image';
      document.head.appendChild(preload);
    }
  });
  useOn('mouseenter', prefetch);
  useOn('touchstart', prefetch);
  useOn('focus', prefetch);


  return <a {...props} href={`${url.origin}/${params.lang}/pokemon/${pokemon.id}`}>
    <Slot />
  </a>
})

export const PokemonLink = component$<Props>(({ pokemon, ...props }) => {
  const { url, params } = useLocation();

  const prefetch = $(() => {
    const id = `prefetch-pokemon-${pokemon.id}`;
    if (document.getElementById(id)) return;
      const prefetch = document.createElement('link');
      prefetch.id = id;
      prefetch.rel = 'prefetch';
      prefetch.href = `${url.origin}/data/${params.lang}/pokemon/${pokemon.id}.json`;
      document.head.appendChild(prefetch);
    if (pokemon.imgName) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.href = `${url.origin}/imgs/pokemon/${pokemon.imgName}/600w.avif`;
      preload.as = 'image';
      document.head.appendChild(preload);
    }
  });

  return <Link
    {...props}
    href={`${url.origin}/${params.lang}/pokemon/${pokemon.id}`}
    onMouseEnter$={prefetch}
    onTouchStart$={prefetch}
    onFocus$={prefetch}
  >
    <Slot />
  </Link>
})