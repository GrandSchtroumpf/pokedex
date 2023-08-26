import type { Type } from "~/model/type";
import type { APIPokemon, APIType} from "./api";
import { getAll } from "./api";
import { optimizeImg } from "./img";
import { writeData } from "./json";

function toPokemon(pokemon: APIPokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.sort((a,b) => a.slot - b.slot).map(type => type.type.name)
  }
}

async function getPokemons() {
  const pokemons = await getAll('pokemon');
  const allImg = pokemons.map(async p => {
    const url = p.sprites.other?.["official-artwork"].front_default;
    if (!url) throw new Error(`Pokemon ${p.name} has no image`);
    return optimizeImg({ name: p.name, url, sizes: [100, 250, 500, 750], folder: `pokemon/${p.name}` })
  });
  
  return Promise.allSettled([
    ...allImg,
    writeData('pokemon', pokemons.map(toPokemon))
  ]);
}

const lch = (l: number, c: number, h: number) => ({ l, c, h });
const typeColors = {
  'bug': lch(0.75, 0.14, 114),
  'dark': lch(0.48, 0.03, 62),
  'dragon': lch(0.5, 0.25, 286),
  'electric': lch(0.86, 0.15, 96),
  'fairy': lch(0.8, 0.11, 332),
  'fighting': lch(0.5, 0.13, 32),
  'fire': lch(0.6, 0.18, 35),
  'flying': lch(0.7, 0.13, 292),
  'ghost': lch(0.5, 0.09, 297),
  'grass': lch(0.77, 0.15, 132),
  'ground': lch(0.81, 0.1, 93),
  'ice': lch(0.85, 0.05, 198),
  'normal': lch(0.72, 0.08, 107),
  'poison': lch(0.5, 0.15, 322),
  'psychic': lch(0.66, 0.16, 4),
  'rock': lch(0.71, 0.11, 98),
  'shadow': lch(0.34, 0.03, 309),
  'steel': lch(0.79, 0.03, 285),
  'unknown': lch(0.67, 0.05, 170),
  'water': lch(0.67, 0.14, 270),
}

function toTypeRecord(types: APIType[]) {
  const record: Record<string, Type> = {};
  for (const type of types) {
    record[type.name] = {
      id: type.id,
      name: type.name as any,
      color: typeColors[type.name as keyof typeof typeColors]
    };
  }
  return record;
}

async function getTypes() {
  const types = await getAll('type');
  const record = toTypeRecord(types);
  return writeData('type', record)
}


function main() {
  return Promise.allSettled([
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