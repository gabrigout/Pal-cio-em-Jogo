const moneyNumber = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const moneyInteger = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** Monetary values throughout the simulation are stored in R$ billions. */
export function formatBRLMoney(amountInBillions: number): string {
  if (!Number.isFinite(amountInBillions)) return 'R$ —'
  const sign = amountInBillions < 0 ? '−' : ''
  const absolute = Math.abs(amountInBillions)
  if (absolute >= 1000) return sign + 'R$ ' + moneyNumber.format(absolute / 1000) + ' tri'
  if (absolute >= 1) return sign + 'R$ ' + moneyNumber.format(absolute) + ' bi'
  if (absolute >= 0.001) return sign + 'R$ ' + moneyInteger.format(absolute * 1000) + ' mi'
  return sign + 'R$ ' + moneyNumber.format(absolute) + ' bi'
}

export function formatBRLMoneyDelta(amountInBillions: number): string {
  if (amountInBillions > 0) return '+' + formatBRLMoney(amountInBillions)
  return formatBRLMoney(amountInBillions)
}
