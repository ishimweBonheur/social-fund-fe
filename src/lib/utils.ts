import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function humanizeValue(value: string) {
  if (!/^[A-Z0-9_ -]+$/.test(value) || !/[A-Z]/.test(value)) return value
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatPersonName(value?: string) {
  if (!value) return '—'
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toUpperCase())
}
