import { component$, Slot, sync$, useOnWindow } from "@qwik.dev/core";


export default component$(() => {
  useOnWindow('pageswap', sync$(() => {
    function isInViewport(el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 0) return false;
      if (rect.left <= 0) return false;
      if (rect.bottom >= window.innerHeight) return false;
      if (rect.right >= window.innerWidth) return false;
      return true;
    }
    const logos = document.querySelectorAll<HTMLImageElement>('[data-app-logo]'); 
    for (const logo of logos) {
      if (!isInViewport(logo)) logo.style.viewTransitionName = 'none';
    }
  }))
  return <Slot />
})