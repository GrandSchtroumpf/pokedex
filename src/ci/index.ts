import { PokemonStat } from "pokenode-ts";
import type { APIPokemon, APISpecies, APIResource} from "./api";
import { getAll } from "./api";
import type { TypeName, SpeciesColor } from "./colors";
import { speciesColor, typeColors } from "./colors";
import { optimizeImg } from "./img";
import { writeData } from "./json";


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

type TextRecord = Record<string, string>;
/** Transform a list of text to a record */
function toText<T extends { language: APIResource }>(list: T[], key: Extract<keyof T, string>): TextRecord {
  const record: Record<string, string> = {};
  for (const item of list) {
    record[item.language.name] = item[key] as string;
  }
  return record;
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

function toPokemon(
  species: APISpecies,
  pokemons: APIPokemon[],
  shapes: Record<string, TextRecord>
) {
  const { id, names, shape } = species;
  const pokemon = pokemons.at(id - 1)!;
  return {
    id,
    imgName: pokemon.name,
    name: toText(names, 'name'),
    shape: shape ? shapes[shape.name] : {}, // species have no shape
    color: speciesColor[species.color.name as SpeciesColor],
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name as TypeName),
    genus: toText(species.genera, 'genus'),
    flavorText: toText(species.flavor_text_entries, 'flavor_text'),
    formDescription: toText(species.form_descriptions, 'description'),
    stats: toStats(pokemon.stats)
  }
}

export type Pokemon = ReturnType<typeof toPokemon>;

async function getPokemons() {
  const [pokemons, species, shapes] = await Promise.all([
    getAll('pokemon'),
    getAll('pokemon-species'),
    getAll('pokemon-shape')
  ]);
  const shapeRecord = toRecord(shapes, 'name', shape => toText(shape.names, 'name'));
  const allPokemons = species.map(p => toPokemon(p, pokemons, shapeRecord));
  
  const allImg = pokemons.map(async p => {
    const url = p.sprites.other?.["official-artwork"].front_default;
    if (!url) throw new Error(`Pokemon ${p.name} has no image`);
    return optimizeImg({ name: p.name, url, sizes: [100, 250, 500, 750], folder: `pokemon/${p.name}` })
  });

  
  return Promise.allSettled([
    ...allImg,
    writeData('pokemon', allPokemons)
  ]);
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
  process.exit(1)
})
.catch(err => {
  console.error(err);
  process.exit(0);
})