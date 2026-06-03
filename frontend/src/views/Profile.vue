<template>
  <div class="profile-page">
    <div class="profile-header-banner">
      <div class="avatar-large">
        <img v-if="profileForm.avatar" :src="profileForm.avatar" alt="avatar" />
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="user-title-info">
        <h2>{{ profileForm.nickname || '未设置昵称' }}</h2>
        <el-tag :type="creditScoreType" effect="dark" class="score-tag">
          信用分：{{ profileForm.creditScore || userStore.creditScore }}
        </el-tag>
      </div>
    </div>

    <el-card class="profile-card">
      <el-tabs v-model="activeTab" class="profile-tabs">

        <el-tab-pane label="基本信息" name="info">
          <el-form :model="profileForm" label-width="90px" class="form-container">
            <div class="form-section-title">账户标识</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学号">
                  <el-input v-model="profileForm.studentId" disabled placeholder="暂无学号信息" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="当前角色">
                  <el-input :value="roleName" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="profileForm.phone" disabled placeholder="未绑定" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" disabled placeholder="未绑定" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider border-style="dashed" />

            <div class="form-section-title">个性化设置</div>
            <el-form-item label="用户昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入新昵称" clearable />
            </el-form-item>
            <el-form-item label="头像URL">
              <el-input v-model="profileForm.avatar" placeholder="在此粘贴头像图片链接 (暂不支持本地上传)" clearable>
                <template #append>
                  <el-tooltip content="输入网络图片的URL地址来更换头像" placement="top">
                    <el-icon><info-filled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item class="submit-item">
              <el-button type="primary" size="large" @click="updateProfile" :loading="loading" class="save-btn">
                保存资料修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form :model="passwordForm" label-width="90px" class="form-container password-form">
            <el-alert
                title="密码修改后您可能需要重新登录"
                type="warning"
                show-icon
                :closable="false"
                class="mb-20"
            />
            <el-form-item label="当前密码">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
            </el-form-item>

            <el-form-item class="submit-item">
              <el-button type="danger" size="large" @click="updatePassword" :loading="pwdLoading" class="save-btn">
                确认修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/user/userStore'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import http from '@/common/http'

const userStore = useUserStore()
const activeTab = ref('info')
const loading = ref(false)
const pwdLoading = ref(false)

// 用于绑定表单的数据模型
const profileForm = reactive({
  studentId: '',
  phone: '',
  email: '',
  nickname: '',
  avatar: '',
  creditScore: 100
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const roleName = computed(() => {
  if (userStore.isAdmin) return '管理员'
  if (userStore.isRequester) return '需求方'
  return '服务方'
})

const creditScoreType = computed(() => {
  const score = profileForm.creditScore || userStore.creditScore
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
})

// 组件挂载时拉取完整的用户信息
onMounted(async () => {
  try {
    // 假设后端有一个获取用户详情的接口，例如 GET /api/user/profile
    // 如果没有这个接口，则降级使用 userStore 中已有的基础数据
    const res = await http.get('/auth/profile')
    if (res.data.code === 200) {
      const data = res.data.data
      profileForm.studentId = data.studentId
      profileForm.phone = data.phone
      profileForm.email = data.email
      profileForm.nickname = data.nickname
      profileForm.avatar = data.avatar
      profileForm.creditScore = data.creditScore
    }
  } catch (err) {
    // 接口不存在或报错时的降级处理
    profileForm.nickname = userStore.nickname
    profileForm.avatar = userStore.avatar
    profileForm.creditScore = userStore.creditScore
    // 学号与手机等信息如果在 store.userInfo 里有也可以直接取用
  }
})

// 更新资料
const updateProfile = async () => {
  if (!profileForm.nickname) {
    ElMessage.warning('昵称不能为空')
    return
  }
  loading.value = true
  try {
    const res = await http.put('/auth/profile', {
      nickname: profileForm.nickname,
      avatar: profileForm.avatar
    })
    if (res.data.code === 200) {
      ElMessage.success('资料更新成功')
      // 同步更新 Pinia Store 中的展示信息
      userStore.nickname = profileForm.nickname
      userStore.avatar = profileForm.avatar
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (err) {
    ElMessage.error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

// 更新密码
const updatePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('密码不能为空')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  pwdLoading.value = true
  try {
    const res = await http.put('/auth/password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    if (res.data.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      userStore.logout()
      location.reload()
    } else {
      ElMessage.error(res.data.message || '密码修改失败')
    }
  } catch (err) {
    ElMessage.error('密码修改失败，请重试')
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 顶部横幅风格 */
.profile-header-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
  border-radius: var(--radius-xl);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  border: 4px solid white;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--text-muted);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-large svg {
  width: 50px;
  height: 50px;
}

.user-title-info h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  color: var(--text-primary);
  font-weight: 700;
}

.score-tag {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

/* 卡片和表单样式 */
.profile-card {
  border-radius: var(--radius-xl);
  padding: 10px;
}

.form-container {
  padding: 20px 0;
  max-width: 600px;
}

.password-form {
  max-width: 500px;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 20px;
  margin-top: 10px;
  border-left: 3px solid var(--primary);
  padding-left: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.submit-item {
  margin-top: 40px;
}

.save-btn {
  width: 150px;
  border-radius: var(--radius-full);
}
</style>