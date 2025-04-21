import { $, component$, isServer, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import type { DocumentHead, StaticGenerateHandler } from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import type { PokemonItem, Generation } from "~/model";
import { PokemonImg } from "~/components/img/img";
import { langs } from "~/data";
import { Logo } from "~/components/logo";
import { useSpeculativeRules } from "~/hooks/useSpeculative";
import { PokemonAnchor } from "~/components/anchor";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { PokemonTypes } from "~/components/pokemon/types";
import SearchWorker from './search.worker?worker';
import style from './index.scss?inline';
import { PokemonName } from "~/components/pokemon/name";

const workers: { current?: Worker } = {};

export const useGenerations = routeLoader$(async ({ params }) => {
  const path = join(cwd(), 'public/data', params.lang, 'generations.json');
  const res = await readFile(path, { encoding: 'utf-8' });
  return JSON.parse(res) as Generation[];
});

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();
  const rules = useSpeculativeRules();
  const listbox = useSignal<HTMLElement>();
  const logo = useSignal<SVGSVGElement>();

  const generations = useGenerations();
  const search = useSignal('');

  useTask$(() => {
    const urls = generations.value.map((g) => `/${params.lang}/${g.id}`);
    rules.push({ type: 'prefetch', urls, source: 'list', eagerness: 'moderate' });
  });

  useTask$(({ cleanup }) => {
    cleanup(() => {
      workers.current?.terminate();
      delete workers.current;
    });
  });
  
  const list = useSignal<PokemonItem[]>([]);
  useTask$(({ track, cleanup }) => {
    const input = track(search);
    if (isServer) return;
    if (!workers.current) {
      workers.current ||= new SearchWorker();
      const urls = generations.value.map((g) => `${url.origin}/data/${params.lang}/generation/${g.id}.json`)
      workers.current.postMessage({ type: 'init', urls });
    } else if (input) {
      const handler = (e: MessageEvent<PokemonItem[]>) => {
        list.value = e.data;
      }
      workers.current.addEventListener('message', handler);
      workers.current.postMessage({ type: 'search', input })
      cleanup(() => workers.current?.removeEventListener('message', handler))
    } else {
      if (!input) list.value = [];
    }
  });

  const open = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search-open'], update: () => dialog.showModal() } as any);
    else dialog.showModal();
    if (!workers.current) {
      workers.current = new SearchWorker();
      const urls = generations.value.map((g) => `${url.origin}/data/${params.lang}/generation/${g.id}.json`)
      workers.current.postMessage({ type: 'init', urls });
    }
    if (logo.value) logo.value.style.viewTransitionName = 'none';
  });

  const startWriting = $((e: KeyboardEvent) => {
    if (e.key.length === 1 && e.key.match(/[\p{Letter}\p{Mark}\s]+/gu)) {
      open();
      search.value = e.key;
    }
  });

  const close = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search-close'], update: () => dialog.close() } as any);
    else dialog.close();
    if (logo.value) logo.value.style.viewTransitionName = 'app-logo';
  });

  const navigate = $((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      const current = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
      if (current) current.removeAttribute('aria-selected');
      const next = current?.nextElementSibling || listbox.value?.querySelector<HTMLElement>(`[role="option"]`);
      next?.setAttribute('aria-selected', 'true');
      next?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
    if (e.key === 'ArrowUp') {
      const current = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
      if (current) current.removeAttribute('aria-selected');
      const next = current?.previousElementSibling || listbox.value?.querySelector<HTMLElement>(`[role="option"]:last-child`);
      next?.setAttribute('aria-selected', 'true');
      next?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  });

  const submit = $(() => {
    const selected = listbox.value?.querySelector<HTMLElement>(`[role="option"][aria-selected="true"]`);
    if (selected) selected.click();
    else listbox.value?.querySelector<HTMLElement>(`[role="option"]`)?.click();
  });

  const beforeNavigate = $((event: Event, el: HTMLElement) => {
    const img = (el.firstElementChild as HTMLElement);
    img.style.viewTransitionName = img.dataset.viewTransitionName!;
  });

  return (
    <>
      <search id="search-section">
        <Logo ref={logo} width="100" height="100" />
        <h1>Pokedex</h1>
        <button aria-controls="search-box" onClick$={open} onKeyDown$={startWriting}>
          <span>Search</span>
        </button>
        <dialog id="search-box" onClick$={(e, el) => e.target === el ? close() : null} onClose$={() => search.value = ''}>
          <form class="search-container" onSubmit$={submit} preventdefault:submit>
            <header>
              <button type="button" onClick$={close} aria-label="Close searchbox">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
              </button>
              <div class="search-field">
                <label for="search-input">Search</label>
                <input id="search-input" type="search" placeholder="" autoFocus bind:value={search} onKeyDown$={navigate} autocomplete="off" />
              </div>
              <button type="button" onClick$={close} aria-label="Close searchbox">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
              </button>
            </header>
            <hr />
            <nav role="listbox" ref={listbox}>
              {list.value.map((pokemon) => (
                <PokemonAnchor role="option" key={pokemon.id} pokemon={pokemon} onClick$={beforeNavigate}>
                  <PokemonImg pokemon={pokemon} width={40} height={40} noViewTransition />
                  <hgroup>
                    <h3>
                      <PokemonName pokemon={pokemon} />
                    </h3>
                    <PokemonTypes class="types" types={pokemon.types} />
                  </hgroup>
                </PokemonAnchor>
              ))}
            </nav>
            <div class="empty">
              <p>Nothing for now</p>
            </div>
          </form>
        </dialog>
      </search>
      <main>
        <GenerationList generations={generations.value} />
      </main>
    </>
  )
});

const GenerationList = component$<{ generations: Generation[] }>(({ generations }) => {
  const { params } = useLocation();
  return (
    <nav class="generation-list">
      {generations.map((generation) => (
        <a key={generation.id} href={`/${params.lang}/${generation.id}`}>
          {generation.name}
        </a>
      ))}
    </nav>
  )
})


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
        name: 'language',
        content: params.lang,
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
  };
};