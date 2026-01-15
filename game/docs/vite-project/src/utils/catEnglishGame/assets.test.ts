import { describe, expect, it } from 'vitest'
import { pickNextQuestionIndex } from './assets'

describe('pickNextQuestionIndex', () => {
  it('returns a valid index for prev=-1', () => {
    for (let i = 0; i < 50; i++) {
      const v = pickNextQuestionIndex(-1, 3)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(3)
    }
  })

  it('never returns prev when len>1', () => {
    for (let i = 0; i < 50; i++) {
      const v = pickNextQuestionIndex(1, 3)
      expect(v).not.toBe(1)
    }
  })
})

