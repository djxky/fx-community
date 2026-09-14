import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SEED_ALBUMS,
  albumSummary,
  deleteAlbum,
  isDraftDirty,
  moveAlbum,
  moveLesson,
  renderAlbumList,
  renderLessonOrder,
  renderPickGrid,
  OWNER_WORKS,
  saveAlbum,
  toggleWork,
  validateAlbumInfo,
  validateAlbumWorks,
} from '../src/studio-albums.mjs'

const draft = (patch = {}) => ({ id: 'new', name: '', intro: '', workIds: [], ...patch })

test('专题卡只展示资源数，讲次不带类型', () => {
  assert.equal(albumSummary(SEED_ALBUMS[0]), '共 2 个资源')
  assert.equal(albumSummary({ workIds: ['feihualing', 'picture-book-questions', 'missing'] }), '共 2 个资源')
  assert.doesNotMatch(renderAlbumList(SEED_ALBUMS), /st-album-ls| 讲 · |使用/)
  assert.doesNotMatch(renderAlbumList(SEED_ALBUMS), /nav-res/)
  assert.match(renderAlbumList(SEED_ALBUMS), /class="st-album" data-album-id="album-poetry" role="link"/)
})

test('专题名称必填、不超长、不与其它专题重名', () => {
  assert.equal(validateAlbumInfo(SEED_ALBUMS, draft({ name: '   ' })), '请填写专题名称')
  assert.equal(validateAlbumInfo(SEED_ALBUMS, draft({ name: '一'.repeat(21) })), '专题名称最多 20 个字')
  assert.equal(validateAlbumInfo(SEED_ALBUMS, draft({ name: ' 古诗文课堂互动 ' })), '已有同名专题，换个名字吧')
  assert.equal(validateAlbumInfo(SEED_ALBUMS, { ...SEED_ALBUMS[0] }), '')
})

test('至少选 1 个作品才能保存', () => {
  assert.equal(validateAlbumWorks(draft()), '至少选 1 个作品')
  assert.equal(validateAlbumWorks(draft({ workIds: ['luoluobi'] })), '')
})

test('新专题放在最前，编辑保持原位置', () => {
  const created = saveAlbum(SEED_ALBUMS, draft({ name: ' 新专题 ', workIds: ['luoluobi'] }))
  assert.deepEqual(created.map((a) => a.id), ['new', 'album-poetry', 'album-writing'])
  assert.equal(created[0].name, '新专题')

  const edited = saveAlbum(SEED_ALBUMS, { ...SEED_ALBUMS[1], name: '写作课' })
  assert.deepEqual(edited.map((a) => a.name), ['古诗文课堂互动', '写作课'])
})

test('删除专题与调整专题顺序', () => {
  assert.deepEqual(deleteAlbum(SEED_ALBUMS, 'album-poetry').map((a) => a.id), ['album-writing'])
  assert.deepEqual(moveAlbum(SEED_ALBUMS, 'album-writing', -1).map((a) => a.id), ['album-writing', 'album-poetry'])
  assert.equal(moveAlbum(SEED_ALBUMS, 'album-poetry', -1), SEED_ALBUMS)
})

test('勾选顺序即讲次顺序，可上下调整', () => {
  let ids = toggleWork([], 'luoluobi')
  ids = toggleWork(ids, 'feihualing')
  assert.deepEqual(ids, ['luoluobi', 'feihualing'])
  assert.deepEqual(moveLesson(ids, 'feihualing', -1), ['feihualing', 'luoluobi'])
  assert.deepEqual(toggleWork(ids, 'luoluobi'), ['feihualing'])
})

test('未改动（含只加空格）不算有未保存内容', () => {
  const initial = draft({ name: '古诗文', workIds: ['a'] })
  assert.equal(isDraftDirty({ ...initial, name: '古诗文 ' }, initial), false)
  assert.equal(isDraftDirty({ ...initial, workIds: ['a', 'b'] }, initial), true)
})

test('专题卡菜单首个不可上移、末个不可下移，名称做转义', () => {
  const albums = [{ ...SEED_ALBUMS[0], name: '<b>古诗</b>' }, SEED_ALBUMS[1]]
  const first = renderAlbumList(albums, 'album-poetry')
  assert.match(first, /data-album-act="up" disabled/)
  assert.doesNotMatch(first, /data-album-act="down" disabled/)
  assert.match(first, /&lt;b&gt;古诗&lt;\/b&gt;/)
  assert.match(renderAlbumList(albums, 'album-writing'), /data-album-act="down" disabled/)
  assert.doesNotMatch(renderAlbumList(albums), /st-album-menu/)
})

test('选作品网格与讲次列表的空状态', () => {
  assert.match(renderPickGrid([], []), /还没有作品，先去创作吧/)
  assert.match(renderPickGrid(OWNER_WORKS, [], '不存在'), /没有找到相关作品/)
  assert.match(renderPickGrid(OWNER_WORKS, ['luoluobi'], '落落笔'), /album-wk sel/)
  assert.match(renderLessonOrder([]), /按勾选顺序排成第 1 讲/)
  assert.match(renderLessonOrder(['luoluobi', 'feihualing']), /第1讲[\s\S]*落落笔[\s\S]*第2讲[\s\S]*飞花令/)
})
