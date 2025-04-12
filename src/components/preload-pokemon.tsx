import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { Generation } from "~/model";

export const PreloadPokemons = component$<{ generations: Generation[]}>(({ generations }) => {
  const { url, params } = useLocation();
  return (
    <>
      {generations.map(({ id }) => (
        <link key={id} rel="preload" as="fetch" href={`${url.origin}/data/${params.lang}/generation/${id}.json`} />
      ))}
    </>
  )
})