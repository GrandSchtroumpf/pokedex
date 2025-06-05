import type { QwikJSX} from "@qwik.dev/core";
import { Slot, component$ } from "@qwik.dev/core";
import type { LinkProps} from "@qwik.dev/router";
import { useLocation } from "@qwik.dev/router";

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