import type { APIPokemon } from "~/ci/api";

export interface Pokemon {
  id: APIPokemon['id'];
  name: APIPokemon['name'];
}