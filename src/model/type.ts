export type TypeName = "bug" | "dark" | "dragon" | "electric" | "fairy" | "fighting" | "fire" | "flying" | "ghost" | "grass" | "ground" | "ice" | "normal" | "poison" | "psychic" | "rock" | "shadow" | "steel" | "unknown" | "water";

export interface Type {
  id: number;
  name: TypeName;
  color: {
    l: number,
    c: number,
    h: number,
  }
}