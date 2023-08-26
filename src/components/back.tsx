import { Slot, component$ } from "@builder.io/qwik";
import type { LinkProps} from "@builder.io/qwik-city";
import { Link, useLocation } from "@builder.io/qwik-city";

interface BackProps extends LinkProps {}

export const Back = component$((props: BackProps) => {
  const { prevUrl, url } = useLocation();
  if (prevUrl && prevUrl.toString() !== url.toString()) {
    return <button onClick$={() => history.back()}>
      <Slot/>
    </button>
  } else {
    return <Link {...props}>
      <Slot/>
    </Link>
  }
})