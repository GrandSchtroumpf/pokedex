export type TypeName = 'normal' | 'fighting' | 'flying' | 'poison' | 'ground' | 'rock' | 'bug' | 'ghost' | 'steel' | 'fire' | 'water' | 'grass' | 'electric' | 'psychic' | 'ice' | 'dragon' | 'dark' | 'fairy' | 'stellar' | 'unknown' | 'shadow';

export interface Type {
  id: number;
  name: TypeName;
  color: {
    l: number,
    c: number,
    h: number,
  }
}