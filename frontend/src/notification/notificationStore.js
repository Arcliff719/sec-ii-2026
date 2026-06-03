import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/common/http'
import { ElMessage } from 'element-plus'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 获取通知列表
  async function fetchNotifications(page = currentPage.value, size = pageSize.value, unreadOnly = false) {
    loading.value = true
    try {
      const res = await http.get('/notifications', {
        params: { pageNum: page, pageSize: size, unreadOnly }
      })
      const pageData = res.data.data
      notifications.value = pageData.items || []
      total.value = pageData.pagination?.total || 0
      currentPage.value = page
    } catch (error) {
      ElMessage.error(error.message || '获取通知失败')
    } finally {
      loading.value = false
    }
  }

  // 获取未读数量
  async function fetchUnreadCount() {
    try {
      const res = await http.get('/notifications/unread-count')
      unreadCount.value = res.data.data
    } catch (error) {
      console.error('获取未读数量失败', error)
    }
  }

  // 标记单条已读
  async function markAsRead(notificationId) {
    try {
      await http.put(`/notifications/${notificationId}/read`)
      // 更新本地列表中的状态
      const idx = notifications.value.findIndex(n => n.id === notificationId)
      if (idx !== -1 && !notifications.value[idx].isRead) {
        notifications.value[idx].isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      ElMessage.success('已标记为已读')
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }

  // 全部已读
  async function markAllAsRead() {
    try {
      await http.put('/notifications/read-all')
      // 更新本地列表
      notifications.value.forEach(n => { n.isRead = true })
      unreadCount.value = 0
      ElMessage.success('全部已读')
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    }
  }

  // 刷新列表
  async function refresh() {
    await fetchNotifications(currentPage.value, pageSize.value)
    await fetchUnreadCount()
  }

  return {
    notifications,
    unreadCount,
    total,
    loading,
    currentPage,
    pageSize,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh
  }
})