<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { COVERS } from '../data/covers'

const emit = defineEmits(['close', 'imported'])

// 三种来源 + 各自的示例（demo 桩：老板可直接点“开始转换”看效果）
const sources = [
  { key: 'html', icon: '📄', name: '上传 HTML 文件 / 文件包', hint: '老师最常见 · 零门槛', field: '选择文件' },
  { key: 'github', icon: '🔗', name: '粘贴 GitHub 链接', hint: '开发者型 / skill 仓库', field: '仓库地址' },
  { key: 'skill', icon: '✦', name: '粘贴 skill / 应用', hint: '豆包、八里等别处生成', field: '内容 / 链接' },
]

const SAMPLES = {
  html: {
    badge: '从 HTML 导入', input: '二次函数图象·拖动探究.html',
    title: '二次函数图象·拖动探究互动页', category: '互动课件', coverIndex: 3,
    fit: { subject: '数学', grade: '初中·九年级', textbook: '人教版', lessonType: '新授课' },
    goal: '用可拖动的参数滑块，让学生直观看到 a、b、c 如何改变抛物线的开口与位置。',
  },
  github: {
    badge: '从 GitHub 导入', input: 'github.com/teacher/word-eliminate',
    title: '英语单词消消乐·教学游戏', category: '教学游戏', coverIndex: 4,
    fit: { subject: '英语', grade: '小学·四年级', textbook: '人教 PEP', lessonType: '词汇复习' },
    goal: '把本单元词汇做成消除小游戏，课堂热身两分钟点燃全班参与。',
  },
  skill: {
    badge: '从 skill 导入', input: '作文批改分层评语.skill',
    title: '作文批改·分层评语 skill', category: '技能', coverIndex: 2,
    fit: { subject: '语文', grade: '初中·通用', textbook: '通用', lessonType: '写作讲评' },
    goal: '按班级学情自动生成分层评语与提升建议，减少重复批改工作量。',
  },
}

const convertSteps = ['识别资源类型…', '补齐学科 / 年级 / 教材 / 课型…', '生成封面与社区标题…', '合规与教材 / 课标检查…']

const step = ref('source')          // source | converting | preview
const sourceKey = ref('html')
const sourceInput = ref(SAMPLES.html.input)
const progress = ref(0)
let timers = []

// 预览可微调
const title = ref('')
const goal = ref('')
const result = ref(null)

const activeSource = computed(() => sources.find((s) => s.key === sourceKey.value))

function pickSource(key) {
  sourceKey.value = key
  sourceInput.value = SAMPLES[key].input
}

function clearTimers() {
  timers.forEach((t) => window.clearTimeout(t))
  timers = []
}

function startConvert() {
  if (!String(sourceInput.value).trim()) return
  step.value = 'converting'
  progress.value = 0
  clearTimers()
  convertSteps.forEach((_, i) => {
    timers.push(window.setTimeout(() => { progress.value = i + 1 }, 520 * (i + 1)))
  })
  timers.push(window.setTimeout(() => {
    const s = SAMPLES[sourceKey.value]
    result.value = { ...s, cover: COVERS[s.coverIndex] }
    title.value = s.title
    goal.value = s.goal
    step.value = 'preview'
  }, 520 * convertSteps.length + 420))
}

function saveDraft() {
  const s = result.value
  emit('imported', {
    title: title.value.trim() || s.title,
    category: s.category,
    fit: { ...s.fit },
    goal: goal.value.trim() || s.goal,
    cover: s.cover,
    source: s.badge,
  })
}

onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="imp-backdrop" role="presentation" @click.self="emit('close')">
    <section class="imp-modal" role="dialog" aria-modal="true" aria-labelledby="imp-title">
      <div class="imp-head">
        <div>
          <div class="imp-kicker">从外部导入作品</div>
          <h2 id="imp-title">把你在别处做的作品，搬进飞象</h2>
          <p>飞象会自动转成符合要求的资源，先落到「我的生成」当草稿，确认无误再发布到社区。</p>
        </div>
        <button class="imp-close" type="button" aria-label="关闭导入" @click="emit('close')">×</button>
      </div>

      <!-- 步骤条 -->
      <ol class="imp-steps" aria-hidden="true">
        <li :class="{ on: step === 'source', done: step !== 'source' }">1 选来源</li>
        <li :class="{ on: step === 'converting', done: step === 'preview' }">2 AI 转换</li>
        <li :class="{ on: step === 'preview' }">3 确认落库</li>
      </ol>

      <!-- 1 选来源 -->
      <div v-if="step === 'source'" class="imp-body">
        <div class="imp-source-grid">
          <button
            v-for="s in sources"
            :key="s.key"
            type="button"
            class="imp-source"
            :class="{ on: sourceKey === s.key }"
            @click="pickSource(s.key)"
          >
            <span class="imp-source-icon">{{ s.icon }}</span>
            <span class="imp-source-name">{{ s.name }}</span>
            <span class="imp-source-hint">{{ s.hint }}</span>
          </button>
        </div>

        <label class="imp-field">
          <span>{{ activeSource.field }}</span>
          <div class="imp-input-wrap">
            <input v-model="sourceInput" type="text" :aria-label="activeSource.field" />
          </div>
          <small>演示已填好示例，点「开始 AI 转换」即可看效果。</small>
        </label>

        <div class="imp-actions">
          <button class="imp-btn ghost" type="button" @click="emit('close')">取消</button>
          <button class="imp-btn solid" type="button" :disabled="!sourceInput.trim()" @click="startConvert">开始 AI 转换 →</button>
        </div>
      </div>

      <!-- 2 转换中 -->
      <div v-else-if="step === 'converting'" class="imp-body">
        <div class="imp-convert">
          <div class="imp-spinner" aria-hidden="true"></div>
          <div class="imp-convert-title">AI 转换适配中</div>
          <ul class="imp-convert-list">
            <li v-for="(t, i) in convertSteps" :key="i" :class="{ done: progress > i, active: progress === i }">
              <span class="imp-tick" aria-hidden="true">{{ progress > i ? '✓' : '' }}</span>{{ t }}
            </li>
          </ul>
          <p class="imp-convert-note">正在把它转成飞象格式——这一步是关键：识别类型、补齐元数据、生成封面与标题。</p>
        </div>
      </div>

      <!-- 3 结果预览 -->
      <div v-else class="imp-body">
        <div class="imp-result">
          <div class="imp-cover">
            <img :src="result.cover" alt="转换生成的封面" />
            <span class="imp-cover-type">{{ result.category }}</span>
          </div>
          <div class="imp-result-main">
            <div class="imp-badge-row">
              <span class="imp-src-chip">{{ result.badge }}</span>
              <span class="imp-ok-chip">✓ 已转成飞象资源</span>
            </div>
            <label class="imp-field tight">
              <span>标题 <em>AI 起草 · 可改</em></span>
              <input v-model="title" type="text" maxlength="40" aria-label="作品标题" />
            </label>
            <div class="imp-fit">
              <span class="imp-fit-label">自动补齐的适用信息</span>
              <div class="imp-pills">
                <span>{{ result.fit.subject }}</span>
                <span>{{ result.fit.grade }}</span>
                <span>{{ result.fit.textbook }}</span>
                <span>{{ result.fit.lessonType }}</span>
              </div>
            </div>
            <label class="imp-field tight">
              <span>一句话说明</span>
              <textarea v-model="goal" rows="2" maxlength="120" aria-label="一句话说明"></textarea>
            </label>
          </div>
        </div>

        <div class="imp-hint-strip">转换完成后会作为<b>草稿</b>存入「我的生成」；发布仍走作品卡上的<b>「发布到社区」</b>，两步分开。</div>

        <div class="imp-actions">
          <button class="imp-btn ghost" type="button" @click="step = 'source'">重新选来源</button>
          <button class="imp-btn solid" type="button" @click="saveDraft">存入我的生成（草稿）</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.imp-backdrop { position:fixed; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(20,31,27,.62); }
.imp-modal { width:min(640px, 100%); max-height:calc(100vh - 48px); overflow-y:auto; border:1px solid #E3E4E3; border-radius:18px; background:#fff; box-shadow:0 18px 60px rgba(20,31,27,.22); }
.imp-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:25px 28px 18px; border-bottom:1px solid #F0F0EE; }
.imp-kicker { color:#8A6D00; font-size:12px; font-weight:700; letter-spacing:1.4px; }
.imp-head h2 { margin:7px 0 0; color:#141F1B; font-size:21px; line-height:1.35; }
.imp-head p { margin:6px 0 0; color:#9A9A9A; font-size:12.5px; line-height:1.6; }
.imp-close { flex-shrink:0; border:0; padding:0 4px; background:none; color:#9A9A9A; font-size:25px; line-height:1; cursor:pointer; }
.imp-close:hover { color:#141F1B; }

.imp-steps { display:flex; gap:8px; margin:0; padding:16px 28px 0; list-style:none; }
.imp-steps li { flex:1; padding:7px 0; border-radius:8px; background:#F6F6F6; color:#9A9A9A; text-align:center; font-size:12px; font-weight:600; }
.imp-steps li.on { background:#141F1B; color:#fff; }
.imp-steps li.done { background:#FFF6DF; color:#8A6D00; }

.imp-body { padding:20px 28px 26px; }

.imp-source-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
.imp-source { display:flex; flex-direction:column; align-items:flex-start; gap:5px; padding:14px 14px 13px; border:1.5px solid #E3E4E3; border-radius:13px; background:#fff; text-align:left; cursor:pointer; transition:border-color .15s, box-shadow .15s; }
.imp-source:hover { border-color:#C9C7C0; }
.imp-source.on { border-color:#D9AF3C; box-shadow:0 0 0 3px rgba(217,175,60,.12); }
.imp-source-icon { font-size:19px; }
.imp-source-name { color:#141F1B; font-size:13px; font-weight:700; line-height:1.4; }
.imp-source-hint { color:#9A9A9A; font-size:11px; }

.imp-field { display:block; margin:18px 0 0; }
.imp-field > span { display:flex; align-items:baseline; gap:8px; margin-bottom:8px; color:#141F1B; font-size:13px; font-weight:700; }
.imp-field em { color:#9A9A9A; font-size:11px; font-style:normal; font-weight:400; }
.imp-field.tight { margin-top:14px; }
.imp-input-wrap { display:flex; }
.imp-field input, .imp-field textarea { width:100%; border:1px solid #E3E4E3; border-radius:9px; padding:9px 11px; outline:none; background:#fff; color:#141F1B; font-size:13px; }
.imp-field textarea { resize:vertical; line-height:1.6; }
.imp-field input:focus, .imp-field textarea:focus { border-color:#B7A15A; box-shadow:0 0 0 3px rgba(217,175,60,.12); }
.imp-field small { display:block; margin-top:6px; color:#9A9A9A; font-size:11px; }

.imp-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:22px; }
.imp-btn { border-radius:10px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; }
.imp-btn.ghost { border:1px solid #E3E4E3; background:#fff; color:#141F1B; }
.imp-btn.solid { border:1px solid #141F1B; background:#141F1B; color:#fff; }
.imp-btn.solid:hover { background:#2C3632; }
.imp-btn.solid:disabled { opacity:.4; cursor:not-allowed; }

.imp-convert { display:flex; flex-direction:column; align-items:center; padding:16px 0 8px; text-align:center; }
.imp-spinner { width:34px; height:34px; border:3px solid #F0EBD8; border-top-color:#D9AF3C; border-radius:50%; animation:imp-spin .8s linear infinite; }
@keyframes imp-spin { to { transform:rotate(360deg); } }
.imp-convert-title { margin-top:15px; color:#141F1B; font-size:15px; font-weight:700; }
.imp-convert-list { width:100%; max-width:320px; margin:16px 0 0; padding:0; list-style:none; text-align:left; }
.imp-convert-list li { display:flex; align-items:center; gap:9px; padding:7px 0; color:#B6B8B6; font-size:13px; transition:color .2s; }
.imp-convert-list li.active { color:#141F1B; }
.imp-convert-list li.done { color:#8A6D00; }
.imp-tick { display:inline-flex; align-items:center; justify-content:center; width:17px; height:17px; flex-shrink:0; border:1px solid #E3E4E3; border-radius:50%; font-size:10px; }
.imp-convert-list li.done .imp-tick { border-color:#D9AF3C; background:#FFF6DF; color:#8A6D00; }
.imp-convert-note { max-width:360px; margin:16px 0 0; color:#9A9A9A; font-size:12px; line-height:1.7; }

.imp-result { display:flex; gap:16px; }
.imp-cover { position:relative; width:172px; flex-shrink:0; aspect-ratio:16/10; overflow:hidden; border-radius:12px; background:#EFEFEF; }
.imp-cover img { width:100%; height:100%; display:block; object-fit:cover; }
.imp-cover-type { position:absolute; left:9px; top:9px; border-radius:7px; padding:3px 9px; background:rgba(20,31,27,.86); color:#fff; font-size:11px; font-weight:600; }
.imp-result-main { flex:1; min-width:0; }
.imp-badge-row { display:flex; gap:8px; }
.imp-src-chip { border:1px solid #E3E4E3; border-radius:20px; padding:3px 11px; color:#7A7C7C; font-size:11.5px; }
.imp-ok-chip { border:1px solid #FBEFC6; border-radius:20px; padding:3px 11px; background:#FFF6DF; color:#8A6D00; font-size:11.5px; font-weight:600; }
.imp-fit { margin-top:14px; }
.imp-fit-label { color:#9A9A9A; font-size:11px; }
.imp-pills { display:flex; flex-wrap:wrap; gap:7px; margin-top:7px; }
.imp-pills span { border:1px solid #E9E9E7; border-radius:7px; padding:4px 9px; background:#F6F6F6; color:#141F1B; font-size:12px; }
.imp-hint-strip { margin-top:20px; border:1px solid #ECECEC; border-left:3px solid #D9AF3C; border-radius:10px; padding:11px 14px; background:#FCFBF7; color:#7A7C7C; font-size:12.5px; line-height:1.7; }
.imp-hint-strip b { color:#141F1B; font-weight:600; }

@media (max-width:620px) {
  .imp-backdrop { padding:12px; align-items:flex-end; }
  .imp-modal { max-height:calc(100vh - 24px); }
  .imp-head, .imp-body, .imp-steps { padding-inline:20px; }
  .imp-source-grid { grid-template-columns:1fr; }
  .imp-result { flex-direction:column; }
  .imp-cover { width:100%; }
}
</style>
