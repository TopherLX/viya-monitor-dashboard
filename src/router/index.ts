import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewPage from '@/pages/OverviewPage.vue'
import ServerDetailPage from '@/pages/ServerDetailPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'overview',
      component: OverviewPage,
    },
    {
      path: '/server/:hostName',
      name: 'server-detail',
      component: ServerDetailPage,
      props: true,
    },
  ],
})

export default router
