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