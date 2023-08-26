import { Slot, component$, createContextId, useContextProvider, useSignal } from "@builder.io/qwik";
import type { Signal} from "@builder.io/qwik";

export const ViewTransitionContext = createContextId<Signal<string>>('ViewTransitionContext');

export default component$(() => {
  const viewTransitionNames = useSignal('');
  useContextProvider(ViewTransitionContext, viewTransitionNames);
  return <>
    <style dangerouslySetInnerHTML={viewTransitionNames.value}></style>
    <Slot/>
  </>
})