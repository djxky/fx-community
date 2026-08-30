<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  resource: { type: Object, required: true },
  origin: { type: Object, default: null },
})
const emit = defineEmits(['close', 'published'])

const title = ref(props.resource.title)
const subject = ref(props.resource.fit?.subject || '')
const grade = ref(props.resource.fit?.grade || '')
const textbook = ref(props.resource.fit?.textbook || '')
const lessonType = ref(props.resource.fit?.lessonType || '')
const type = ref(props.item.category || props.resource.kind)
const description = ref(props.resource.goal || '')
const error = ref('')

function submit() {
  const required = [title.value, subject.value, grade.value, textbook.value, lessonType.value, type.value, description.value]
  if (required.some((value) => !String(value).trim())) {
    error.value = '请补全标题、适用信息、类型和设计说明后再发布。'
    return
  }

  error.value = ''
  emit('published', {
    title: title.value.trim(),
    fit: {
      subject: subject.value.trim(),
      grade: grade.value.trim(),
      textbook: textbook.value.trim(),
      lessonType: lessonType.value.trim(),
    },
    type: type.value.trim(),
    description: description.value.trim(),
  })
}
</script>

<template>
  <div class="publish-backdrop" role="presentation" @click.self="emit('close')">
    <section class="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title">
      <div class="publish-head">
        <div>
          <div class="publish-kicker">发布到飞象社区</div>
          <h2 id="publish-title">让你的好课被更多老师看见</h2>
          <p>发布前确认作品信息；社区统计从发布后重新开始。</p>
        </div>
        <button class="publish-close" type="button" aria-label="关闭发布流" @click="emit('close')">×</button>
      </div>

      <form class="publish-form" @submit.prevent="submit">
        <label class="publish-field publish-field-title">
          <span>① 标题 <em>AI 起草 · 老师确认</em></span>
          <input v-model="title" type="text" maxlength="60" aria-label="发布标题" />
          <small>清楚说出这份作品解决什么课堂问题，不用夸张标题。</small>
        </label>

        <fieldset class="publish-fieldset">
          <legend>② 适用行</legend>
          <div class="publish-fit-grid">
            <label><span>学科</span><input v-model="subject" type="text" aria-label="学科" /></label>
            <label><span>年级</span><input v-model="grade" type="text" aria-label="年级" /></label>
            <label><span>教材</span><input v-model="textbook" type="text" aria-label="教材" /></label>
            <label><span>课型</span><input v-model="lessonType" type="text" aria-label="课型" /></label>
          </div>
        </fieldset>

        <label class="publish-field">
          <span>③ 类型</span>
          <input v-model="type" type="text" maxlength="20" aria-label="作品类型" />
        </label>

        <label class="publish-field">
          <span>设计说明 / 可改编范围</span>
          <textarea v-model="description" rows="3" maxlength="180" aria-label="设计说明和可改编范围"></textarea>
        </label>

        <div v-if="origin" class="publish-origin">
          <div class="publish-origin-title">④ 改编来源 <span>署名回链不可移除</span></div>
          <button class="publish-origin-link" type="button" :data-resource-id="origin.id" @click="emit('close')">
            改编自 {{ origin.author.name }} 的《{{ origin.title }}》 ↗
          </button>
        </div>

        <div v-if="error" class="publish-error" role="alert">{{ error }}</div>
        <div class="publish-actions">
          <button class="publish-cancel" type="button" @click="emit('close')">先不发布</button>
          <button class="publish-submit" type="submit">⑤ 确认发布</button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.publish-backdrop { position:fixed; inset:0; z-index:80; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(20,31,27,.62); }
.publish-modal { width:min(620px, 100%); max-height:calc(100vh - 48px); overflow-y:auto; border:1px solid #E3E4E3; border-radius:18px; background:#fff; box-shadow:0 18px 60px rgba(20,31,27,.22); }
.publish-head { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:25px 28px 20px; border-bottom:1px solid #F0F0EE; }
.publish-kicker { color:#8A6D00; font-size:12px; font-weight:700; letter-spacing:1.4px; }
.publish-head h2 { margin:7px 0 0; color:#141F1B; font-size:21px; line-height:1.35; }
.publish-head p { margin:6px 0 0; color:#9A9A9A; font-size:12.5px; }
.publish-close { flex-shrink:0; border:0; padding:0 4px; background:none; color:#9A9A9A; font-size:25px; line-height:1; cursor:pointer; }
.publish-close:hover { color:#141F1B; }
.publish-form { padding:22px 28px 26px; }
.publish-field, .publish-fieldset { display:block; margin:0 0 18px; border:0; padding:0; }
.publish-field > span, .publish-fieldset legend { display:flex; align-items:baseline; gap:8px; margin-bottom:8px; color:#141F1B; font-size:13px; font-weight:700; }
.publish-field em { color:#9A9A9A; font-size:11px; font-style:normal; font-weight:400; }
.publish-field input, .publish-field textarea, .publish-fit-grid input { width:100%; border:1px solid #E3E4E3; border-radius:9px; padding:9px 11px; outline:none; background:#fff; color:#141F1B; font-size:13px; }
.publish-field textarea { resize:vertical; line-height:1.6; }
.publish-field input:focus, .publish-field textarea:focus, .publish-fit-grid input:focus { border-color:#B7A15A; box-shadow:0 0 0 3px rgba(217,175,60,.12); }
.publish-field small { display:block; margin-top:5px; color:#9A9A9A; font-size:11px; }
.publish-fit-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; }
.publish-fit-grid label { display:block; min-width:0; }
.publish-fit-grid label > span { display:block; margin-bottom:5px; color:#9A9A9A; font-size:11px; }
.publish-origin { margin:2px 0 18px; border:1px solid #FBEFC6; border-radius:11px; padding:12px 14px; background:#FFF6DF; }
.publish-origin-title { display:flex; align-items:center; gap:7px; color:#8A6D00; font-size:12px; font-weight:700; }
.publish-origin-title span { color:#B09B61; font-size:11px; font-weight:400; }
.publish-origin-link { margin-top:7px; border:0; padding:0; background:none; color:#141F1B; font-size:13px; cursor:pointer; }
.publish-origin-link:hover { text-decoration:underline; }
.publish-error { margin:-4px 0 15px; color:#FF4832; font-size:12px; line-height:1.5; }
.publish-actions { display:flex; justify-content:flex-end; gap:10px; padding-top:3px; }
.publish-cancel, .publish-submit { border-radius:10px; padding:10px 18px; font-size:13px; font-weight:600; cursor:pointer; }
.publish-cancel { border:1px solid #E3E4E3; background:#fff; color:#141F1B; }
.publish-submit { border:1px solid #141F1B; background:#141F1B; color:#fff; }
.publish-submit:hover { background:#2C3632; }
@media (max-width:620px) { .publish-backdrop { padding:12px; align-items:flex-end; } .publish-modal { max-height:calc(100vh - 24px); } .publish-head, .publish-form { padding-inline:20px; } .publish-fit-grid { grid-template-columns:repeat(2, 1fr); } }
</style>
