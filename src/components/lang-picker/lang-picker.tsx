import { $, component$, Resource, useStyles$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
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
      <button id="current-lang" onClick$={open}>
        {params.lang}
      </button>
      <dialog id="lang-picker" onClick$={(e, el) => e.target === el ? el.close() : null}>
        <Resource value={languagesResource} onResolved={(languages) => (
          <ul>
            {languages.map((language) => (
              <li key={language.id}>
                <Link href={`/${language.id}`}>{language.name}</Link>
              </li>
            ))}
          </ul>
        )} />
      </dialog>
    </>
  )
})