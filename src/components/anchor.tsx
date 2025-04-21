import type { PropsOf} from "@builder.io/qwik";
import { $, component$, Slot, useComputed$, useId, useOn } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
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
  const href = useComputed$(() => {
    return `${url.origin}/${params.lang}/pokemon/${pokemon.id}`;
  });

  const prefetch = $(() => {
    const id = `prefetch-pokemon-${pokemon.id}`;
    if (!href.value || document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'prefetch';
    link.href = href.value;
    document.head.appendChild(link);
  });
  useOn('mouseenter', prefetch);
  useOn('touchstart', prefetch);
  useOn('focus', prefetch);


  return <a {...props} href={href.value}>
    <Slot />
  </a>
})