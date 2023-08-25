import type { APIPokemon} from "./api";
import { getAll } from "./api";
import { optimizeImg } from "./img";
import { writeList } from "./json";

function toPokemon(pokemon: APIPokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
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
    writeList('pokemon', pokemons.map(toPokemon))
  ]);
}

function main() {
  return getPokemons();
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