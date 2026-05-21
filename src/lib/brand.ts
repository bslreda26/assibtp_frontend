/** Identité visuelle Assi grueBTP — noir, jaune, blanc */
export const APP_NAME = 'Assi grueBTP'
export const APP_TAGLINE = 'Gestion des grues'
export const APP_FULL_TITLE = `${APP_NAME} — ${APP_TAGLINE}`

/** Couleurs PDF (RGB) */
export const BRAND_PDF = {
  black: [15, 15, 15] as [number, number, number],
  yellow: [255, 193, 7] as [number, number, number],
  yellowLight: [255, 249, 219] as [number, number, number],
  yellowSoft: [255, 236, 179] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  muted: [90, 85, 75] as [number, number, number],
  border: [40, 40, 40] as [number, number, number],
} as const
