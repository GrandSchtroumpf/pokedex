import { component$, useStyles$} from "@qwik.dev/core";
import { routeLoader$, type DocumentHead } from "@qwik.dev/router";
import type { Language } from "pokenode-ts";
import { Logo } from "~/components/logo";
import style from './index.scss?inline';
import { join } from "node:path";
import { cwd } from "node:process";
import { readFile } from "node:fs/promises";

export const useLanguages = routeLoader$(async () => {
  const path = join(cwd(), 'public/data/en/languages.json');
  const res = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(res) as Language[];
})

export default component$(() => {
  useStyles$(style);
  const languages =  useLanguages();

  return (
    <main id="select-lang-page">
      <h1>Pokedex</h1>
      <Logo width="100" height="100" />
      <nav>
        {languages.value.map((language) => (
          <a key={language.id} href={`/${language.id}`}>{language.name}</a>
        ))}
      </nav>
    </main>
  )
});

export const head: DocumentHead = ({ url }) => ({
  title: "Pokedex",
  links: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: `${url.origin}/imgs/logo/original.svg`,
    }
  ],
  meta: [
    {
      name: "description",
      content: "A pokedex showcase",
    },
    {
      name: 'og:url',
      content: `${url.origin}`,
    },
    {
      name: 'og:image',
      content: `${url.origin}/imgs/logo/500.jpg`,
    },
    {
      name: 'og:image:width',
      content: '500',
    },
    {
      name: 'og:image:height',
      content: '500',
    },
  ],
});
