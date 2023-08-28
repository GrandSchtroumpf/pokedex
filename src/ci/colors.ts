const lch = (l: number, c: number, h: number) => ({ l, c, h });

export type SpeciesColor = keyof typeof speciesColor;
export const speciesColor = {
  black: lch(0, 0, 0),
  blue: lch(0.45, 0.31, 264),
  brown: lch(0.48, 0.16, 26),
  gray: lch(0.6, 0, 0),
  green: lch(0.52, 0.18, 142),
  pink: lch(0.87, 0.07, 7),
  purple: lch(0.42, 0.19, 328),
  red: lch(0.63, 0.26, 29),
  white: lch(1, 0, 0),
  yellow: lch(0.97, 0.21, 110),
}

export type TypeName = keyof typeof typeColors;
export const typeColors = {
  bug: lch(0.75, 0.14, 114),
  dark: lch(0.48, 0.03, 62),
  dragon: lch(0.5, 0.25, 286),
  electric: lch(0.86, 0.15, 96),
  fairy: lch(0.8, 0.11, 332),
  fighting: lch(0.5, 0.13, 32),
  fire: lch(0.6, 0.18, 35),
  flying: lch(0.7, 0.13, 292),
  ghost: lch(0.5, 0.09, 297),
  grass: lch(0.77, 0.15, 132),
  ground: lch(0.81, 0.1, 93),
  ice: lch(0.85, 0.05, 198),
  normal: lch(0.72, 0.08, 107),
  poison: lch(0.5, 0.15, 322),
  psychic: lch(0.66, 0.16, 4),
  rock: lch(0.71, 0.11, 98),
  shadow: lch(0.34, 0.03, 309),
  steel: lch(0.79, 0.03, 285),
  unknown: lch(0.67, 0.05, 170),
  water: lch(0.67, 0.14, 270),
}