import type { QwikJSX} from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";
import type { LinkProps} from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";

type BackProps = LinkProps & QwikJSX.IntrinsicElements['button'];
// interface BackProps extends LinkProps {}

export const Back = component$((props: BackProps) => {
  const { prevUrl, url } = useLocation();
  if (prevUrl && prevUrl.toString() !== url.toString()) {
    return <button {...props} onClick$={() => history.back()}>
      <Slot/>
    </button>
  } else {
    return <a {...props}>
      <Slot/>
    </a>
  }
})