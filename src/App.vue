<script setup>
import { onMounted } from 'vue'
import { store } from './store'
import { installDelegation } from './composables/delegation'
import { RESOURCES_BY_ID } from './data/resources'
import { getResourceRouteFromSearch } from './resource-navigation.mjs'
import DiscoverView from './views/DiscoverView.vue'
import RankView from './views/RankView.vue'
import AcademyView from './views/AcademyView.vue'
import CreatorView from './views/CreatorView.vue'
import StudioView from './views/StudioView.vue'
import ResView from './views/ResView.vue'
import SkillView from './views/SkillView.vue'
import ShareView from './views/ShareView.vue'
import ReportView from './views/ReportView.vue'
import MonthlyView from './views/MonthlyView.vue'
import ActivityView from './views/ActivityView.vue'
import LineageView from './views/LineageView.vue'
import NotifyView from './views/NotifyView.vue'
import MyLibraryView from './views/MyLibraryView.vue'

const initialResourceRoute = getResourceRouteFromSearch(
  window.location.search,
  new Set(Object.keys(RESOURCES_BY_ID)),
)

if (initialResourceRoute) {
  store.view = initialResourceRoute.view
  store.resourceId = initialResourceRoute.resourceId
} else {
  store.view = 'rank'
}

onMounted(() => installDelegation())
</script>

<template>
  <DiscoverView v-show="store.view === 'discover'" />
  <RankView v-show="store.view === 'rank'" />
  <AcademyView v-show="store.view === 'academy'" />
  <CreatorView v-show="store.view === 'creator'" />
  <StudioView v-show="store.view === 'studio'" />
  <ResView v-show="store.view === 'res'" />
  <SkillView v-show="store.view === 'skill'" />
  <ShareView v-show="store.view === 'share'" />
  <ReportView v-show="store.view === 'report'" />
  <MonthlyView v-show="store.view === 'monthly'" />
  <ActivityView v-show="store.view === 'activity'" />
  <LineageView v-show="store.view === 'lineage'" />
  <NotifyView v-show="store.view === 'notify'" />
  <MyLibraryView v-show="store.view === 'mylib'" />
</template>
