/** Curated portrait URLs — Black professionals (Unsplash, face-cropped). */
const crop = 'w=150&h=150&fit=crop&crop=face'

export const avatars = {
  user: `https://images.unsplash.com/photo-1560250097-0b93528c311a?${crop}`,
  aisha: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?${crop}`,
  marcus: `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?${crop}`,
  jordan: `https://images.unsplash.com/photo-1531123897727-8f129e00ccb3?${crop}`,
  financeTeam: `https://images.unsplash.com/photo-1556157382-97eda2d62296?${crop}`,
  payment1: `https://images.unsplash.com/photo-1619895862022-291a34764e4f?${crop}`,
  payment2: `https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?${crop}`,
  payment3: `https://images.unsplash.com/photo-1582750433449-648ed127bbfe?${crop}`,
  payment4: `https://images.unsplash.com/photo-1633332755198-0da61562d553?${crop}`,
} as const

export const mandatoryPaymentAvatars = [
  avatars.payment1,
  avatars.payment2,
  avatars.payment3,
  avatars.payment4,
] as const

const contactPool = [
  avatars.aisha,
  avatars.marcus,
  avatars.jordan,
  avatars.financeTeam,
  avatars.payment1,
  avatars.payment2,
] as const

export function pickContactAvatar(seed = '') {
  if (!seed) {
    return contactPool[Math.floor(Math.random() * contactPool.length)]
  }
  const idx =
    seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % contactPool.length
  return contactPool[idx]
}
