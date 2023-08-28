export const cssColor = ({ l, c, h }: { l: number, c: number, h: number}) => (Object.entries({
  '--lum': l,
  '--chroma': c,
  '--hue': h,
}).map(([key, v]) => `${key}: ${v}`).join(';'))