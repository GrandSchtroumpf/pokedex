import type { APIPokemon } from "~/ci/api";
import type { TypeName } from "./type";

export interface Pokemon {
  id: APIPokemon['id'];
  name: APIPokemon['name'];
  types: TypeName[];
}