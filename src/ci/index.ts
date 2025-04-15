import type { PokemonStat } from "pokenode-ts";
import type { APIPokemon, APISpecies, APIResource, APILanguage, APIGeneration } from "./api";
import type { TypeName, SpeciesColor } from "./colors";
import { getAll } from "./api";
import { speciesColor, typeColors } from "./colors";
import { optimizeImg } from "./img";
import { writeData } from "./json";
import { langs } from "~/data";


// Utils
function toRecord<I, O>(
  list: I[],
  keyName: Extract<keyof I, string>,
  transorm: ((input: I) => O)
) {
  const record: Record<string, O> = {};
  for (const item of list) {
    const key = item[keyName] as string;
    record[key] = transorm(item);
  }
  return record;
}

/** Transform a list of text to a record */
function toText<T extends { language: APIResource }>(list: T[], key: Extract<keyof T, string>, lang: string): string {
  for (const item of list) {
    if (item.language.name === lang) return item[key] as string;
  }
  return '';
}

// POKEMON
function toStats(stats: PokemonStat[]) {
  const record: Record<string, { value: number, effort: number }> = {};
  for (const stat of stats) {
    record[stat.stat.name] = {
      value: stat.base_stat,
      effort: stat.effort
    }
  }
  return record;
}

function toPokemonItem(
  species: APISpecies,
  pokemons: APIPokemon[],
  shapes: Record<string, string>,
  lang: string,
) {
  const { id, names, shape } = species;
  const pokemon = pokemons.at(id - 1)!;
  return {
    id,
    imgName: pokemon.name,
    name: toText(names, 'name', lang),
    shape: typeof shape !== 'undefined' ? shapes[shape.name] : '', // species have no shape
    color: speciesColor[species.color.name as SpeciesColor],
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name as TypeName),
    genus: toText(species.genera, 'genus', lang),
    flavorText: toText(species.flavor_text_entries, 'flavor_text', lang),
    formDescription: toText(species.form_descriptions, 'description', lang),
  }
}

function toPokemon(
  species: APISpecies,
  pokemons: APIPokemon[],
  shapes: Record<string, string>,
  lang: string,
) {
  const { id, names, shape } = species;
  const pokemon = pokemons.at(id - 1)!;
  return {
    id,
    imgName: pokemon.name,
    name: toText(names, 'name', lang),
    shape: typeof shape !== 'undefined' ? shapes[shape.name] : '', // species have no shape
    color: speciesColor[species.color.name as SpeciesColor],
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name as TypeName),
    genus: toText(species.genera, 'genus', lang),
    flavorText: toText(species.flavor_text_entries, 'flavor_text', lang),
    formDescription: toText(species.form_descriptions, 'description', lang),
    stats: toStats(pokemon.stats),
  }
}

function toLanguage(language: APILanguage, lang: string) {
  return {
    id: language.name,
    name: toText(language.names, 'name', lang)
  }
}

function toGeneration(genaration: APIGeneration, lang: string) {
  return { id: genaration.name, name: toText(genaration.names, 'name', lang) }
}

export type Pokemon = ReturnType<typeof toPokemon>;
export type PokemonItem = ReturnType<typeof toPokemonItem>;
export type Language = ReturnType<typeof toLanguage>;
export type Generation = ReturnType<typeof toGeneration>;

async function getPokemons() {
  const [pokemons, species, shapes, languages, generations] = await Promise.all([
    getAll('pokemon'),
    getAll('pokemon-species'),
    getAll('pokemon-shape'),
    getAll('language'),
    getAll('generation'),
  ]);
  
  const writes: (() => Promise<any>)[] = [];

  for (const p of pokemons) {
    const url = p.sprites.other?.["official-artwork"].front_default;
    if (!url) {
      console.warn(`Pokemon ${p.name} has no image`);
      continue;
    }
    writes.push(() => {
      return optimizeImg({ url, sizes: [50, 100, 300, 600, 750], folder: `pokemon/${p.name}` })
    });
  }

  for (const lang of langs) {

    // Language list
    const languageNames = languages.filter(v => langs.includes(v.name)).map((l) => toLanguage(l, lang));
    writes.push(writeData(`${lang}/languages`, languageNames));

    // Generation names
    const generationNames = generations.map((g) => toGeneration(g, lang));
    writes.push(writeData(`${lang}/generations`, generationNames));

    const generationRecord: Record<string, PokemonItem[]> = {};
    const shapeRecord = toRecord(shapes, 'name', shape => toText(shape.names, 'name', lang));
    for (const p of species) {
      // Each pokemon
      const pokemon = toPokemon(p, pokemons, shapeRecord, lang);
      writes.push(writeData(`${lang}/pokemon/${pokemon.id}`, pokemon));
      // Pokemon in generation
      const pokemonItem = toPokemonItem(p, pokemons, shapeRecord, lang);
      generationRecord[p.generation.name] ||= [];
      generationRecord[p.generation.name].push(pokemonItem);
    }
    // List of pokemon per generation
    for (const generation in generationRecord) {
      writes.push(writeData(`${lang}/generation/${generation}`, generationRecord[generation]))
    }
  }

  for (let i = 0; i < writes.length; i += 50) {
    console.log('Batch', i);
    const batch = [];
    for (let j = i; j < Math.min(i + 50, writes.length); j++) {
      batch.push(writes[j]());
    }
    const results = await Promise.allSettled(batch);
    for (const res of results) {
      if (res.status === 'rejected') console.warn(res.reason);
    }
  }
  
}

// TYPES
async function getTypes() {
  const types = await getAll('type');
  const record = toRecord(types, 'name', type => ({
    id: type.id,
    name: type.name as any,
    color: typeColors[type.name as keyof typeof typeColors]
  }));
  return writeData('type', record)
}


function main() {
  return Promise.all([
    getPokemons(),
    getTypes(),
  ]);
}


main()
.then(() => {
  console.log('Closing gracefuly');
  process.exit(0)
})
.catch(err => {
  console.error(err);
  process.exit(1);
})