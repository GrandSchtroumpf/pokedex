import { component$, Resource, useResource$, useStyles$} from "@builder.io/qwik";
import { Link, useLocation, type DocumentHead } from "@builder.io/qwik-city";
import type { Language } from "pokenode-ts";
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
      <Resource value={languagesResource} onResolved={(languages) => (
        <nav>
          {languages.map((language) => (
            <Link key={language.id} href={`/${language.id}`}>{language.name}</Link>
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
      type: 'image/webp',
      href: `${url.origin}/imgs/pokemon/unown/100w.webp`,
    }
  ],
  meta: [
    {
      name: "description",
      content: "A pokedex showcase",
    },
  ],
});
