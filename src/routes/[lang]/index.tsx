import { $, component$, Resource, useComputed$, useSignal, useStyles$ } from "@builder.io/qwik";
import { useGenerations } from "~/hooks/useData";
import { Link, useLocation } from "@builder.io/qwik-city";
import type { Pokemon } from "~/model";
import { PokemonImg } from "~/components/img/img";
import style from './index.scss?inline';

export default component$(() => {
  useStyles$(style);
  const { url, params } = useLocation();

  const generationsResource = useGenerations();
  const search = useSignal('');
  const allPokemon = useSignal<Pokemon[]>([]);

  const list = useComputed$(() => {
    if (!search.value) return [];
    const input = search.value.toLowerCase();
    return allPokemon.value.filter((p) => p.name.toLowerCase().includes(input));
  })

  const preloadPokemon = $(async () => {
    if (allPokemon.value.length) return;
    const generations = await generationsResource.value;
    const getAll = generations.map((g) => fetch(`${url.origin}/data/${params.lang}/generation/${g.id}.json`).then(res => res.json()));
    const matrix = await Promise.all(getAll);
    allPokemon.value = matrix.flat();
  });

  const open = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search'], update: () => dialog.showModal() } as any);
    else dialog.showModal();
    preloadPokemon();
  });

  const close = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition({ types: ['search'], update: () => dialog.close() } as any);
    else dialog.close();
  });

  const clear = $(() => {
    (document.getElementById('search-input') as HTMLInputElement)!.value = ''
  });


  return (
    <>
      <search id="search-section">
        <h1>Pokedex</h1>
        <button aria-controls="search-box" onClick$={open}>
          <span>Search</span>
        </button>
        <dialog id="search-box" onClick$={(e, el) => e.target === el ? close() : null}>
          <div class="search-container">
            <header>
              <button onClick$={close}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
              </button>
              <div class="search-field">
                <label for="search-input">Search</label>
                <input id="search-input" type="search" placeholder="" autoFocus bind:value={search}/>
              </div>
              <button onClick$={clear}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
              </button>
            </header>
            <hr />
            <nav>
              {list.value.map((pokemon) => (
                <Link key={pokemon.id} href={`pokemon/${pokemon.id}`}>
                  <PokemonImg pokemon={pokemon} width={24} height={24} />
                  <h3>{pokemon.name}</h3>
                </Link>
              ))}
            </nav>
            <div class="empty">
              <p>Nothing for now</p>
            </div>
          </div>
        </dialog>
      </search>
      <main>
        <Resource value={generationsResource} onResolved={(generations) => (
          <ul>
            {generations.map((generation) => (
              <li key={generation.id}>
                <Link href={generation.id.toString()}>{generation.name}</Link>
              </li>
            ))}
          </ul>
        )} />
      </main>
    </>
  )
});

// export const onStaticGenerate: StaticGenerateHandler = async () => {
//   const params: {lang: string}[] = [];
//   for (const lang of langs) {
//     params.push({ lang });
//   }
//   return { params };
// };