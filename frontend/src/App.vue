<template>
  <div id="app-container" :class="{ 'dark': isDark }">
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="logo-text">CampusHub</span>
        </router-link>

        <nav class="nav-links" v-if="userStore.isLoggedIn">
          <router-link to="/" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            需求广场
          </router-link>
          <router-link v-if="userStore.isRequester" to="/tasks/publish" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            发布需求
          </router-link>
          <router-link to="/my-tasks" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
            我的需求
          </router-link>
          <router-link v-if="userStore.isAdmin" to="/admin" class="nav-item" active-class="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            后台管理
          </router-link>
        </nav>

        <div class="nav-actions">
          <button
              v-if="userStore.isLoggedIn && !userStore.isAdmin"
              class="role-switch-btn"
              @click="userStore.switchRole()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 3l4 4-4 4"/>
              <path d="M20 7H4"/>
              <path d="M8 21l-4-4 4-4"/>
              <path d="M4 17h16"/>
            </svg>
            <span>切换为{{ userStore.isRequester ? '服务方' : '需求方' }}</span>
          </button>

          <span v-if="userStore.isLoggedIn && userStore.isAdmin" class="admin-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            管理员
          </span>

          <el-popover
              v-if="userStore.isLoggedIn && route.path === '/'"
              ref="notifyPopover"
              placement="bottom-end"
              :width="360"
              trigger="click"
              :hide-after="0"
              @show="loadRecentNotifications"
          >
            <template #reference>
              <el-badge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0" class="notification-badge">
                <el-button link class="notification-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </el-button>
              </el-badge>
            </template>
            <div class="notification-popover" @click.stop>
              <div class="popover-header">
                <span>通知</span>
                <el-button link type="primary" @click="goToNotifications">查看更多</el-button>
              </div>
              <div class="popover-list" v-loading="recentLoading">
                <div v-if="recentNotifications.length === 0" class="empty-tip">暂无通知</div>
                <div
                    v-for="item in recentNotifications"
                    :key="item.id"
                    class="popover-item"
                    :class="{ unread: !item.isRead }"
                    @click.stop="handleNotificationClick(item)"
                >
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-content">{{ item.content }}</div>
                  <div class="item-time">{{ formatDate(item.createTime) }}</div>
                </div>
              </div>
            </div>
          </el-popover>

          <div v-if="userStore.isLoggedIn" class="user-profile-entry" @click="goToProfile">
            <div class="avatar-circle">
              <img v-if="userStore.avatar" :src="userStore.avatar" alt="avatar" />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span class="username-text">{{ userStore.nickname || '用户' }}</span>
          </div>

          <button v-if="userStore.isLoggedIn" class="logout-icon-btn" @click="handleLogout" title="退出登录">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <div class="bg-decoration">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/user/userStore'
import { useNotificationStore } from '@/notification/notificationStore'
import http from '@/common/http'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const isDark = ref(false)

// ======== 通知相关逻辑 ========
const recentNotifications = ref([])
const recentLoading = ref(false)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function loadRecentNotifications() {
  recentLoading.value = true
  try {
    const res = await http.get('/notifications', {
      params: { page: 1, size: 5, unreadOnly: false }
    })
    recentNotifications.value = res.data.data.items || []
  } catch (error) {
    console.error('加载通知失败', error)
  } finally {
    recentLoading.value = false
  }
}

async function handleNotificationClick(item) {
  // 如果通知内容包含 complaintId，跳转到对应申诉详情页（业务逻辑）
  const match = item.content?.match(/complaintId=(\d+)/)
  if (match) {
    router.push(`/admin/complaint/${match[1]}`)
  }
  if (!item.isRead) {
    notificationStore.markAsRead(item.id)
    const idx = recentNotifications.value.findIndex(n => n.id === item.id)
    if (idx !== -1) recentNotifications.value[idx].isRead = true
    notificationStore.fetchUnreadCount()
  }
}

function goToNotifications() {
  router.push('/notifications')
}

// ======== 用户操作逻辑 ========
const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// ======== 生命周期与监听 ========
onMounted(() => {
  if (!userStore.isLoggedIn && route.path !== '/login') {
    router.push('/login')
  } else if (userStore.isLoggedIn && route.path === '/') {
    notificationStore.fetchUnreadCount()
  }
})

watch(() => userStore.isLoggedIn, (newVal) => {
  if (newVal && route.path === '/') {
    notificationStore.fetchUnreadCount()
  }
})

watch(() => route.path, (newPath) => {
  if (userStore.isLoggedIn && newPath === '/') {
    notificationStore.fetchUnreadCount()
  }
})
</script>

<style>
/* ===== CSS Variables - 设计系统 ===== */
:root {
  --primary: #10b981;
  --primary-light: #34d399;
  --primary-dark: #059669;
  --accent: #f59e0b;
  --accent-light: #fbbf24;
  --accent-dark: #d97706;
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.navbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 20px;
  transition: var(--transition-base);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.logo-icon svg {
  width: 20px;
  height: 20px;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-base);
  position: relative;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  color: var(--primary);
  background: rgba(16, 185, 129, 0.08);
}

.nav-item.active {
  color: var(--primary);
  background: rgba(16, 185, 129, 0.12);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
}

.role-switch-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(16, 185, 129, 0.04);
}

.role-switch-btn svg {
  width: 16px;
  height: 16px;
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.admin-badge svg {
  width: 14px;
  height: 14px;
}

.notification-badge {
  margin-left: 8px;
  cursor: pointer;
}

.notification-icon {
  padding: 8px;
  border-radius: 50%;
  background: transparent;
}

.notification-icon svg {
  width: 22px;
  height: 22px;
  color: #475569;
}

.notification-icon:hover {
  background: rgba(16, 185, 129, 0.1);
}

.notification-popover {
  max-height: 400px;
  overflow-y: auto;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
}

.popover-list {
  max-height: 340px;
  overflow-y: auto;
}

.popover-item {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.popover-item:hover {
  background: #f8fafc;
}

.popover-item.unread {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-content {
  font-size: 13px;
  color: #475569;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 12px;
  color: #94a3b8;
}

.empty-tip {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
}

.user-profile-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition-base);
  background: transparent;
}

.user-profile-entry:hover {
  background: rgba(16, 185, 129, 0.08);
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-circle svg {
  width: 20px;
  height: 20px;
}

.username-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.logout-icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: var(--transition-fast);
}

.logout-icon-btn:hover {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

.logout-icon-btn svg {
  width: 18px;
  height: 18px;
}

.main-content {
  padding-top: 88px;
  padding-bottom: 40px;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: blob-float 20s ease-in-out infinite;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.08));
  bottom: -150px;
  left: -150px;
  animation-delay: -5s;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 197, 253, 0.05));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 40px) scale(1.02); }
}

.el-card {
  border: none !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-md) !important;
  transition: var(--transition-base) !important;
}

.el-card:hover {
  box-shadow: var(--shadow-lg) !important;
}

.el-button--primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-light)) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
}

.el-input__wrapper {
  border-radius: var(--radius-md) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-color) !important;
  transition: var(--transition-base) !important;
}

.el-input__wrapper:hover,
.el-input__wrapper:focus-within {
  border-color: var(--primary) !important;
}

.el-select__wrapper {
  border-radius: var(--radius-md) !important;
}

.el-tag {
  border-radius: var(--radius-full) !important;
  border: none !important;
  font-weight: 500 !important;
}

.el-tag--primary {
  background: rgba(16, 185, 129, 0.1) !important;
  color: var(--primary-dark) !important;
}

.el-tag--warning {
  background: rgba(245, 158, 11, 0.1) !important;
  color: var(--accent-dark) !important;
}

.el-tag--success {
  background: rgba(34, 197, 94, 0.1) !important;
  color: #15803d !important;
}

.el-tag--info {
  background: rgba(148, 163, 184, 0.15) !important;
  color: var(--text-secondary) !important;
}

@media (max-width: 768px) {
  .navbar-inner { padding: 0 16px; }
  .nav-links { display: none; }
  .logo-text { display: none; }
  .main-content { padding-left: 16px; padding-right: 16px; }
  .role-switch-btn span { display: none; }
  .notification-badge { margin-left: 4px; }
  .notification-icon svg { width: 20px; height: 20px; }
}
</style>