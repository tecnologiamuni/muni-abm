export function formatDate(date: string | null | undefined) {
  if (!date) {
    return ""
  }

  const [year, month, day] = date.slice(0, 10).split("-")
  if (!year || !month || !day) {
    return date
  }

  return `${day}/${month}/${year}`
}

export function calculateAge(date: string | null | undefined) {
  if (!date) return null

  const [year, month, day] = date.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null

  const birthDate = new Date(year, month - 1, day)
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - year
  if (
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)
  ) {
    age -= 1
  }

  return age
}

export function parseDisplayDate(date: string) {
  const trimmedDate = date.trim()
  if (!trimmedDate) {
    return ""
  }

  const [day, month, year] = trimmedDate.split("/")
  if (!day || !month || !year || year.length !== 4) {
    return trimmedDate
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}