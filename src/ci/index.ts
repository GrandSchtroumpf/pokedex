import type { ChainLink, PokemonStat } from "pokenode-ts";
import type { APIPokemon, APISpecies, APIResource, APILanguage, APIGeneration, APIEvolution, APIEvolutionDetail } from "./api";
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
function toText<T extends { language: APIResource }>(list: T[] | undefined, key: Extract<keyof T, string>, lang: string): string {
  if (!list) return '';
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
  species: APISpecies | undefined,
  pokemon: APIPokemon,
  shapes: Record<string, string>,
  lang: string,
) {
  const shape = species?.shape;
  const color = species?.color.name as SpeciesColor | null;
  return {
    id: pokemon.id,
    imgName: pokemon.name,
    name: toText(species?.names, 'name', lang),
    shape: typeof shape !== 'undefined' ? shapes[shape.name] : '', // species have no shape
    color: color ? speciesColor[color] : 'black',
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name as TypeName),
    genus: toText(species?.genera, 'genus', lang),
    flavorText: toText(species?.flavor_text_entries, 'flavor_text', lang),
    formDescription: toText(species?.form_descriptions, 'description', lang),
  }
}

function toPokemon(
  pokemon: APIPokemon,
  items: Map<string, PokemonItem>,
  position: { previous?: string, next?: string },
  evolution: Evolution | undefined,
) {
  const item = items.get(pokemon.name)!
  return {
    ...item,
    previous: items.get(position.previous || ''),
    next: items.get(position.next || ''),
    evolution,
    stats: toStats(pokemon.stats),
  }
}

function toLanguage(language: APILanguage, lang: string) {
  return {
    id: language.name,
    name: toText(language.names, 'name', lang)
  }
}

function toGeneration(generation: APIGeneration, lang: string) {
  return { id: generation.name, name: toText(generation.names, 'name', lang) }
}

function toEvolutionDetails(details: APIEvolutionDetail[]) {
  return details.map((v) => v.trigger.name);
}

// TODO: return evolution as a table
function toEvolution(chain: ChainLink, itemsMap: Map<string, PokemonItem>) {
  const pokemons: string[] = [chain.species.name];
  const root: Evolution = {
    pokemon: itemsMap.get(chain.species.name)!,
    details: toEvolutionDetails(chain.evolution_details),
    next: []
  };
  for (const next of chain.evolves_to) {
    const result = toEvolution(next, itemsMap);
    pokemons.push(...result.pokemons);
    root.next.push(result.root);
  }
  return { pokemons, root };
  
}

export type Pokemon = ReturnType<typeof toPokemon>;
export type PokemonItem = ReturnType<typeof toPokemonItem>;
export type Language = ReturnType<typeof toLanguage>;
export type Generation = ReturnType<typeof toGeneration>;
export type EvolutionDetails = ReturnType<typeof toEvolutionDetails>;
export type Evolution = {
  pokemon: PokemonItem;
  details: EvolutionDetails;
  next: Evolution[];
};

async function getPokemons() {
  const writes: (() => Promise<any>)[] = [];

  const [pokemons, species, shapes, languages, generations, evolutions] = await Promise.all([
    getAll('pokemon'),
    getAll('pokemon-species'),
    getAll('pokemon-shape'),
    getAll('language'),
    getAll('generation'),
    getAll('evolution-chain'),
  ]);

  // RAW
  const evolutionMap = new Map<string, APIEvolution>();
  for (const evolution of evolutions) {
    evolutionMap.set(evolution.chain.species.name, evolution);
  }
  const pokemonMap = new Map<string, APIPokemon>();
  for (const pokemon of pokemons) {
    pokemonMap.set(pokemon.name, pokemon);
  }
  const speciesMap = new Map<string, APISpecies>();
  for (const specie of species) {
    speciesMap.set(specie.name, specie);
  }

  // Langes
  for (const lang of langs) {
    const shapeRecord = toRecord(shapes, 'name', shape => toText(shape.names, 'name', lang));
    const generationRecord: Record<string, PokemonItem[]> = {};
    const pokemonItems = new Map<string, PokemonItem>();
  
    for (const pokemon of pokemonMap.values()) {
      const species = speciesMap.get(pokemon.name);
      if (!species) console.warn(`No species found for ${pokemon.name}`);
      const item = toPokemonItem(
        species,
        pokemon,
        shapeRecord,
        lang
      );
      pokemonItems.set(pokemon.name, item);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const generationName = species?.generation.name;
      if (generationName) {
        generationRecord[generationName] ||= [];
        generationRecord[generationName].push(item);
      }
    }


    const evolutionMap = new Map<string, Evolution>();
    for (const evolution of evolutions) {
      const { pokemons, root } = toEvolution(evolution.chain, pokemonItems);
      for (const pokemon of pokemons) {
        evolutionMap.set(pokemon, root);
      }
    }

    for (const pokemon of pokemonMap.values()) {
      const currentGen = speciesMap.get(pokemon.name)?.generation.name;
      const getNameByIndex = (index: number) => {
        const name = pokemons[index - 1]?.name;
        const previousGen = speciesMap.get(name)?.generation.name;
        if (previousGen !== currentGen) return;
        return name;
      }
      const position = {
        previous: getNameByIndex(pokemon.id - 1),
        next: getNameByIndex(pokemon.id + 1),
      };
      const full = toPokemon(
        pokemon,
        pokemonItems,
        position,
        evolutionMap.get(pokemon.name)
      );
      writes.push(writeData(`${lang}/pokemon/${pokemon.id}`, full));
    }

    // List of pokemon per generation
    for (const generation in generationRecord) {
      writes.push(writeData(`${lang}/generation/${generation}`, generationRecord[generation]))
    }

    // Language list
    const languageNames = languages.filter(v => langs.includes(v.name)).map((l) => toLanguage(l, lang));
    writes.push(writeData(`${lang}/languages`, languageNames));

    // Generation names
    const generationNames = generations.map((g) => toGeneration(g, lang));
    writes.push(writeData(`${lang}/generations`, generationNames));
  }
  

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