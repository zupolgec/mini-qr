const QR_DATA_QUERY_PARAM_KEYS = ['data', 'text', 'value', 'content'] as const

export function getPrefilledQrDataFromSearch(search: string): string | null {
  const normalizedSearch = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(normalizedSearch)

  for (const key of QR_DATA_QUERY_PARAM_KEYS) {
    const value = params.get(key)

    if (value && value.trim() !== '') {
      return value
    }
  }

  return null
}
