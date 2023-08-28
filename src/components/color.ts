import { LCH } from "~/model";

export const cssColor = ({ l, c, h }: LCH) => (Object.entries({
  '--lum': l,
  '--chroma': c,
  '--hue': h,
}).map(([key, v]) => `${key}: ${v}`).join(';'))

export const colorString = ({ l, c, h }: LCH) => `oklch(${l} ${c} ${h})`