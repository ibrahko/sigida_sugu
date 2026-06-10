export function formatPrice(amount: string | number, currency = 'XOF'): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(value)) return `0 ${currency}`

  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value) + ` ${currency}`
}
