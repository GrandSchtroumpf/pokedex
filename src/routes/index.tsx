import { component$, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { langs } from '~/data';

export default component$(() => {
  const lang = useSignal('en');
  useVisibleTask$(() => {
    const currentLang = navigator.language.split('-').shift();
    if (currentLang && langs.includes(currentLang)) lang.value = currentLang;
  });
  const {scopeId} = useStylesScoped$(`
    main {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    a {
      padding: 8px 16px;
      border-radius: 4px;
      background-color: oklch(0.2 0.15 340);
      color: oklch(1 0.15 340);
      border: solid 1px oklch(0.8 0.15 340);
      text-decoration: none;
    }
  `);
  return (
    <main>
      <Link class={scopeId} href={`${lang.value}/pokemon`}>Pokemon grid</Link>
      <Link class={scopeId} href={`${lang.value}/list`}>Pokemon list</Link>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Pokedex",
  meta: [
    {
      name: "description",
      content: "A pokedex showcase",
    },
  ],
};
