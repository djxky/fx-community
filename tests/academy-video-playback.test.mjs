import assert from 'node:assert/strict'
import test from 'node:test'
import { setupAcademyVideoPause } from '../src/lib/academy-video-playback.mjs'

test('离开视频详情页时暂停所有课程播放器', () => {
  let handleChange
  let removedChange
  const pauses = [0, 0]
  const videos = pauses.map((_, index) => ({ pause: () => { pauses[index] += 1 } }))
  const root = {
    querySelectorAll: (selector) => selector === '.lp-video video' ? videos : [],
    addEventListener: (type, handler) => { if (type === 'change') handleChange = handler },
    removeEventListener: (type, handler) => { if (type === 'change') removedChange = handler },
  }

  const cleanup = setupAcademyVideoPause(root)
  handleChange({ target: { matches: () => false } })
  assert.deepEqual(pauses, [0, 0])

  handleChange({ target: { matches: (selector) => selector === 'input[type="radio"][name="lp"]' } })
  assert.deepEqual(pauses, [1, 1])

  cleanup()
  assert.equal(removedChange, handleChange)
  assert.deepEqual(pauses, [2, 2])
})
