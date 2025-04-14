import { $, component$, Resource, useComputed$, useSignal, useStyles$ } from "@builder.io/qwik";
import { useGenerations } from "~/hooks/useData";
import type { DocumentHead, StaticGenerateHandler} from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import type { PokemonItem } from "~/model";
import { PokemonImg } from "~/components/img/img";
import style from './index.scss?inline';
import { langs } from "~/data";

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const listbox = useSignal<HTMLElement>();

  const generationsResource = useGenerations();
  const search = useSignal('');
  const allPokemon = useSignal<PokemonItem[]>([]);

  const list = useComputed$(() => {
    if (!search.value) return [];
    const input = search.value.toLowerCase();
    return allPokemon.value.filter((p) => p.name.toLowerCase().includes(input));
  })

  const preloadPokemon = $(async () => {
    if (allPokemon.value.length) return;
    const generations = await generationsResource.value;
    const getAll = generations.map((g) => fetch(`${url.origin}/data/${params.lang}/generation/${g.id}.json`, { priority: 'low' }).then(res => res.json()));
    const matrix = await Promise.all(getAll);
    allPokemon.value = matrix.flat();
  });

  const open = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search-open'], update: () => dialog.showModal() } as any);
    else dialog.showModal();
    queueMicrotask(() => {
      preloadPokemon();
    })
  });

  const close = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search-close'], update: () => dialog.close() } as any);
    else dialog.close();
  });

  const navigate = $((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      const current = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
      if (current) current.removeAttribute('aria-selected');
      const next = current?.nextElementSibling || listbox.value?.querySelector<HTMLElement>(`[role="option"]`);
      next?.setAttribute('aria-selected', 'true');
    }
    if (e.key === 'ArrowUp') {
      const current = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
      if (current) current.removeAttribute('aria-selected');
      const next = current?.previousElementSibling || listbox.value?.querySelector<HTMLElement>(`[role="option"]:last-child`);
      next?.setAttribute('aria-selected', 'true');
    }
  });

  const submit = $(() => {
    const selected = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
    if (selected) selected.click();
    else listbox.value?.querySelector<HTMLElement>(`[role="option"]`)?.click();
  })

  return (
    <>
      <search id="search-section">
        <h1>Pokedex</h1>
        <button aria-controls="search-box" onClick$={open}>
          <span>Search</span>
        </button>
        <dialog id="search-box" onClick$={(e, el) => e.target === el ? close() : null}>
          <form class="search-container" onSubmit$={submit} preventdefault:submit>
            <header>
              <button type="button" onClick$={close}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
              </button>
              <div class="search-field">
                <label for="search-input">Search</label>
                <input id="search-input" type="search" placeholder="" autoFocus bind:value={search} onKeyDown$={navigate}/>
              </div>
              <button type="button" onClick$={close}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
              </button>
            </header>
            <hr />
            <nav role="listbox" ref={listbox}>
              {list.value.map((pokemon) => (
                <a role="option" key={pokemon.id} href={`pokemon/${pokemon.id}`}>
                  <PokemonImg pokemon={pokemon} width={40} height={40} />
                  <h3>{pokemon.name}</h3>
                </a>
              ))}
            </nav>
            <div class="empty">
              <p>Nothing for now</p>
            </div>
          </form>
        </dialog>
      </search>
      <main>
        <Resource value={generationsResource} onResolved={(generations) => (
          <nav class="generation-list">
            {generations.map((generation) => (
              <a key={generation.id} href={generation.id.toString()}>{generation.name}</a>
            ))}
          </nav>
        )} />
      </main>
    </>
  )
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const params: {lang: string}[] = [];
  for (const lang of langs) {
    params.push({ lang });
  }
  return { params };
};

// Now we can export a function that returns a DocumentHead object
export const head: DocumentHead = ({ params, url }) => {
  return {
    title: `Pokedex`,
    links: [
      {
        rel: 'icon',
        type: 'image/webp',
        href: `${url.origin}/imgs/pokemon/unown/100w.webp`,
      }
    ],
    meta: [
      {
        name: 'language',
        content: params.lang,
      },
    ],
  };
};