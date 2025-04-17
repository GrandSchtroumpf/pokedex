import type { PropsOf} from "@builder.io/qwik";
import { $, component$, Slot, useComputed$, useId, useOn } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export const Anchor = component$<PropsOf<'a'>>((props) => {
  const { url } = useLocation();
  const id = useId();
  const prefetch = $(() => {
    if (!props.href || document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'prefetch';
    link.href = props.href;
    document.head.appendChild(link);
  })
  useOn('mouseenter', prefetch);
  useOn('touchstart', prefetch);
  useOn('focus', prefetch);

  const href = useComputed$(() => {
    if (!props.href) return;
    return new URL(props.href, url).href;
  })

  return <a {...props} href={href.value}>
    <Slot />
  </a>
})