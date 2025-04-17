import { $, component$, Resource, useStyles$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useLanguages } from "~/hooks/useData";
import style from './lang-picker.scss?inline';

export const LangPicker = component$(() => {
  useStyles$(style);
  const { params} = useLocation();
  const languagesResource = useLanguages();

  const open = $(() => {
    const picker = document.getElementById('lang-picker') as HTMLDialogElement;
    picker.showModal();
  });
  return (
    <>
      <button id="current-lang" aria-label="Select another lang" onClick$={open}>
        {params.lang}
      </button>
      <dialog id="lang-picker" onClick$={(e, el) => e.target === el ? el.close() : null}>
        <Resource value={languagesResource} onResolved={(languages) => (
          <nav>
            {languages.map((language) => (
              <a key={language.id} href={`/${language.id}`}>{language.name}</a>
            ))}
          </nav>
        )} />
      </dialog>
    </>
  )
})