import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId = ref(null)
  const nickname = ref('')
  const role = ref('')
  const avatar = ref(null)
  const creditScore = ref(5.0)
  const token = ref(null)

  const isRequester = computed(() => role.value === 'requester')
  const isProvider = computed(() => role.value === 'provider')
  const isAdmin = computed(() => role.value === 'admin')
  const isLoggedIn = computed(() => userId.value !== null)

  function login(user, jwtToken) {
    userId.value = user.id
    nickname.value = user.nickname || user.name
    role.value = user.role
    avatar.value = user.avatar
    creditScore.value = user.creditScore ?? 5.0
    token.value = jwtToken
    localStorage.setItem('campusHubToken', jwtToken)
  }

  function logout() {
    userId.value = null
    nickname.value = ''
    role.value = ''
    avatar.value = null
    creditScore.value = 5.0
    token.value = null
    localStorage.removeItem('campusHubToken')
  }

  function restoreToken() {
    const saved = localStorage.getItem('campusHubToken')
    if (saved) token.value = saved
  }

  /** 普通用户在需求方/服务方之间切换身份 */
  /** 普通用户在需求方/服务方之间切换身份 */
  // 在 userStore.js 中修改 switchRole 方法
  async function switchRole() {
    if (role.value === 'admin') return

    // 计算新的角色名称
    const newRole = role.value === 'requester' ? 'provider' : 'requester'

    try {
      const { default: http } = await import('@/common/http')

      // 调用后端接口更新数据库
      // 注意：这里的 role 参数要与后端 User.Role 枚举值匹配 ('requester' 或 'provider')
      await http.put(`/auth/role?role=${newRole}`)

      // 后端更新成功后，再更新前端状态
      role.value = newRole

      const { ElMessage } = await import('element-plus')
      ElMessage.success(`已切换为${newRole === 'requester' ? '需求方' : '服务方'}视图`)
    } catch (error) {
      const { ElMessage } = await import('element-plus')
      ElMessage.error('切换身份失败，请重试')
    }
  }

  async function loginWithPassword(account, password) {
    const { default: http } = await import('@/common/http')
    try {
      const res = await http.post('/auth/login/password', { account, password })
      if (res.data.code === 200) {
        const d = res.data.data
        login({ id: d.userId, nickname: d.nickname, role: 'requester', avatar: null, creditScore: 5.0 }, d.token)
        return true
      }
    } catch { /* handled by interceptor */ }
    return false
  }

  async function loginWithSms(phone, code) {
    const { default: http } = await import('@/common/http')
    try {
      const res = await http.post('/auth/login/sms', { phone, code })
      if (res.data.code === 200) {
        const d = res.data.data
        login({ id: d.userId, nickname: d.nickname, role: 'requester', avatar: null, creditScore: 5.0 }, d.token)
        return true
      }
    } catch { /* handled by interceptor */ }
    return false
  }

  async function register(studentId, phone, password, smsCode) {
    const { default: http } = await import('@/common/http')
    try {
      const res = await http.post('/auth/register', { studentId, name: studentId, phone, password, smsCode })
      if (res.data.code === 200) return true
    } catch { /* handled by interceptor */ }
    return false
  }

  return { userId, nickname, role, avatar, creditScore, token,
           isRequester, isProvider, isAdmin, isLoggedIn,
           login, logout, restoreToken, switchRole,
           loginWithPassword, loginWithSms, register }
})
