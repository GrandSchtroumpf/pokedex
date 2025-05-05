import type { ChainLink, PokemonStat } from "pokenode-ts";
import type { APIPokemon, APISpecies, APIResource, APILanguage, APIGeneration, APIEvolution, APIEvolutionDetail, APIPokemonForm } from "./api";
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
  pokemon: APIPokemon,
  speciesMap: Map<string, APISpecies>,
  formMap: Map<string, APIPokemonForm>,
  shapes: Record<string, string>,
  lang: string,
) {
  const species = speciesMap.get(pokemon.species.name)!;
  const form = formMap.get(pokemon.forms[0].name);
  const shape = species.shape;
  const color = species.color.name as SpeciesColor | null;
  return {
    id: pokemon.id,
    imgName: pokemon.name,
    name: toText(species.names, 'name', lang),
    formName: toText(form?.form_names, 'name', lang),
    shape: typeof shape !== 'undefined' ? shapes[shape.name] : '', // species have no shape
    color: speciesColor[color || 'black'],
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name as TypeName),
    genus: toText(species.genera, 'genus', lang),
    generation: species.generation.name,
    flavorText: toText(species.flavor_text_entries, 'flavor_text', lang),
    formDescription: toText(species.form_descriptions, 'description', lang),
  }
}

function toPokemon(
  pokemon: APIPokemon,
  items: Map<string, PokemonItem>,
  position: { previous?: string, next?: string },
  evolution: (Evolution | null)[][] | undefined,
  species: APISpecies
) {
  const item = items.get(pokemon.name)!
  const varieties = species.varieties.length > 1
    ? species.varieties.map((v) => items.get(v.pokemon.name)!)
    : [];
  return {
    ...item,
    previous: items.get(position.previous || ''),
    next: items.get(position.next || ''),
    evolution,
    stats: toStats(pokemon.stats),
    varieties,
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

const detailTrigger = {
  'level-up': (detail: APIEvolutionDetail) => ({ trigger: 'level-up' as const, value: detail.min_level }),
  'trade': () => ({ trigger: 'trade' as const, value: undefined }),
  'use-item': () => ({ trigger: 'use-item' as const, value: undefined }),
  'shed': () => ({ trigger: 'shed' as const, value: undefined }),
  'spin': () => ({ trigger: 'shed' as const, value: undefined }),
  'tower-of-darkness': () => ({ trigger: 'tower-of-darkness' as const, value: undefined }),
  'tower-of-waters': () => ({ trigger: 'tower-of-waters' as const, value: undefined }),
  'three-critical-hits': () => ({ trigger: 'three-critical-hits' as const, value: undefined }),
  'take-damage': () => ({ trigger: 'take-damage' as const, value: undefined }),
  'other': () => ({ trigger: 'other' as const, value: undefined }),
  'agile-style-move': () => ({ trigger: 'agile-style-move' as const, value: undefined }),
  'strong-style-move': () => ({ trigger: 'strong-style-move' as const, value: undefined }),
  'recoil-damage': () => ({ trigger: 'recoil-damage' as const, value: undefined }),
}
function toEvolutionDetails(details: APIEvolutionDetail[]) {
  return details.map((v) => {
    const trigger = v.trigger.name as keyof typeof detailTrigger;
    if (!(trigger in detailTrigger)) {
      console.warn(trigger + ' is not detailTrigger record');
      return { trigger, value: undefined };
    } else {
      return detailTrigger[trigger](v);
    }
  });
}

function toEvolution(chain: ChainLink, itemsMap: Map<string, PokemonItem>) {
  const matrix: (Evolution | null)[][] = [];

  function traverse(node: ChainLink, depth: number, position: number) {
    matrix[depth] ||= [];
    matrix[depth][position] = {
      pokemon: itemsMap.get(node.species.name),
      details: toEvolutionDetails(node.evolution_details),
    };

    if (node.evolves_to.length) {
      const childrenCount = node.evolves_to.length;
      const startPosition = position;
      for (let i = 0; i < childrenCount; i++) {
        const child = node.evolves_to[i];
        // Calculate the relative horizontal position of the child
        // This is a simplified way to try and distribute children somewhat evenly.
        // A more robust solution might require pre-calculating the width of subtrees.
        let childPosition = startPosition;
        if (childrenCount > 1) {
          // Attempt to place children in the next available slots
          let offset = 0;
          while (matrix[depth + 1] && matrix[depth + 1][childPosition + offset] !== undefined) {
            offset++;
          }
          childPosition += offset;
        }

        traverse(child, depth + 1, childPosition);
      }
    }
  }

  traverse(chain, 0, 0);

  // Normalize the matrix to have consistent row lengths (fill with null)
  const maxRowLength = Math.max(...matrix.map(row => row.length));
  return matrix.map(row => row.concat(Array(maxRowLength - row.length).fill(null)));
}

export type Pokemon = ReturnType<typeof toPokemon>;
export type PokemonItem = ReturnType<typeof toPokemonItem>;
export type Language = ReturnType<typeof toLanguage>;
export type Generation = ReturnType<typeof toGeneration>;
export type EvolutionDetails = ReturnType<typeof toEvolutionDetails>[number];
export type Evolution = {
  pokemon?: PokemonItem;
  details: EvolutionDetails[];
};

async function getPokemons() {
  const writes: (() => Promise<any>)[] = [];

  const [pokemons, species, shapes, languages, generations, evolutions, forms] = await Promise.all([
    getAll('pokemon'),
    getAll('pokemon-species'),
    getAll('pokemon-shape'),
    getAll('language'),
    getAll('generation'),
    getAll('evolution-chain'),
    getAll('pokemon-form')
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
  const formMap = new Map<string, APIPokemonForm>();
  for (const form of forms) {
    formMap.set(form.name, form);
  }

  // Langes
  for (const lang of langs) {
    const shapeRecord = toRecord(shapes, 'name', shape => toText(shape.names, 'name', lang));
    const generationRecord: Record<string, PokemonItem[]> = {};
    const pokemonItems = new Map<string, PokemonItem>();
  
    for (const pokemon of pokemonMap.values()) {
      const item = toPokemonItem(
        pokemon,
        speciesMap,
        formMap,
        shapeRecord,
        lang
      );
      pokemonItems.set(pokemon.name, item);
      
      const species = speciesMap.get(pokemon.species.name)!;
      const generationName = species.generation.name;
      if (generationName) {
        generationRecord[generationName] ||= [];
        generationRecord[generationName].push(item);
      }
    }


    const evolutionMap = new Map<string, (Evolution | null)[][]>();
    for (const evolution of evolutions) {
      const matrix = toEvolution(evolution.chain, pokemonItems);
      const pokemons = new Set(matrix.flat().map((t) => t?.pokemon?.imgName));
      for (const pokemon of pokemons) {
        if (!pokemon) continue;
        evolutionMap.set(pokemon, matrix);
      }
    }

    for (const pokemon of pokemonMap.values()) {
      const species = speciesMap.get(pokemon.species.name)!;
      const currentGen = species.generation.name;
      const getNameByIndex = (index: number) => {
        if (!pokemons[index - 1]) return;
        const p = pokemons[index - 1];
        const previousGen = speciesMap.get(p.species.name)?.generation.name;
        if (previousGen !== currentGen) return;
        return p.name;
      }
      const position = {
        previous: getNameByIndex(pokemon.id - 1),
        next: getNameByIndex(pokemon.id + 1),
      };
      const full = toPokemon(
        pokemon,
        pokemonItems,
        position,
        evolutionMap.get(pokemon.species.name),
        species,
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
      return optimizeImg({ url, sizes: [50, 100, 200, 300, 600, 750], folder: `pokemon/${p.name}` })
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