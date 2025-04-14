import { useResource$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city"
import type { Generation, Language, PokemonItem } from "~/model";

interface DateSource {
  languages: Language[];
  generations: Generation[];
}

export function useData<Key extends keyof DateSource>(src: Key) {
  const { url, params } = useLocation();
  return useResource$<DateSource[Key]>(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/${src}.json`);
    return res.json();
  })
}

export function useLanguages() {
  return useData('languages');
}

export function useGenerations() {
  return useData('generations');
}

export function usePokemonGeneration() {
  const { url, params } = useLocation();
  return useResource$<PokemonItem[]>(async () => {
    const res = await fetch(`${url.origin}/data/${params.lang}/generation/${params.generation}.json`);
    return res.json();
  })
}
