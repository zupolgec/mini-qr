import { getPrefilledQrDataFromSearch } from '@/utils/appUrlParams'

describe('App URL params', () => {
  it('returns the value from the data query param', () => {
    expect(getPrefilledQrDataFromSearch('?data=https%3A%2F%2Fexample.com')).toBe(
      'https://example.com'
    )
  })

  it('supports common fallback query param names', () => {
    expect(getPrefilledQrDataFromSearch('?text=hello%20world')).toBe('hello world')
  })

  it('ignores empty values and falls back to the next supported param', () => {
    expect(getPrefilledQrDataFromSearch('?data=%20%20&value=filled')).toBe('filled')
  })

  it('returns null when no supported param is present', () => {
    expect(getPrefilledQrDataFromSearch('?foo=bar')).toBeNull()
  })
})
