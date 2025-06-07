import { $, component$, Slot, useOnWindow } from "@qwik.dev/core";


export default component$(() => {
  useOnWindow('pageswap', $(() => {
    sessionStorage.setItem('navigating', 'true');
  }));
  useOnWindow('DOMContentLoaded', $(() => {
    const navigating = sessionStorage.getItem('navigating');
    if (navigating) document.documentElement.classList.add('navigating');
  }));
  return <Slot />
})