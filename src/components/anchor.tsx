import type { PropsOf} from "@builder.io/qwik";
import { $, component$, Slot, useId, useOn } from "@builder.io/qwik";

export const Anchor = component$<PropsOf<'a'>>((props) => {
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
  return <a {...props}>
    <Slot />
  </a>
})