import { component$, Resource, useResource$, useStyles$} from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import type { Language } from "pokenode-ts";
import { Logo } from "~/components/logo";
import style from './index.scss?inline';

export default component$(() => {
  useStyles$(style);
  const { url } = useLocation();
  const languagesResource =  useResource$<Language[]>(async () => {
    const res = await fetch(`${url.origin}/data/en/languages.json`);
    return res.json();
  })

  return (
    <main id="select-lang-page">
      <h1>Pokedex</h1>
      <Logo width="100" height="100" />
      <Resource value={languagesResource} onResolved={(languages) => (
        <nav>
          {languages.map((language) => (
            <a key={language.id} href={`/${language.id}`}>{language.name}</a>
          ))}
        </nav>
      )} />
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
