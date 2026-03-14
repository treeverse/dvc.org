enum KEYS {
  RETURN = 13,
  SPACE = 32
}

export const isTriggeredFromKB = (e: React.KeyboardEvent): boolean =>
  e.which === KEYS.RETURN || e.which === KEYS.SPACE
