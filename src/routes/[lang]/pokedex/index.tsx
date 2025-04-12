import { $, component$, useStyles$ } from "@builder.io/qwik";
import style from './index.scss?inline';

export default component$(() => {
  useStyles$(style);

  const open = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition(() => dialog.showModal());
    else dialog.showModal();
  })

  const close = $(() => {
    const dialog = document.getElementById('search-box') as HTMLDialogElement;
    if ('startViewTransition' in document) document.startViewTransition(() => dialog.close());
    else dialog.close();
  })

  const clear = $(() => {
    (document.getElementById('search-input') as HTMLInputElement)!.value = ''
  })

  return (
    <>
      <search>
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
                <input id="search-input" type="search" placeholder="" autoFocus/>
              </div>
              <button onClick$={clear}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
              </button>
            </header>
            <hr />
            <ul></ul>
            <div class="empty">
              <p>Nothing for now</p>
            </div>
          </div>
        </dialog>
      </search>
      <main>
      </main>
    </>
  )
});