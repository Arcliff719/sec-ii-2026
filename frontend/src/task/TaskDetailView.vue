<template>
  <div class="task-detail-wrapper">

    <div class="task-detail-page" v-loading="loading">
      <template v-if="task">
        <button class="back-btn" @click="$router.push('/')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回列表
        </button>

        <div class="detail-container">
          <div class="detail-main">
            <div class="detail-header">
              <div class="header-top">
                <span class="status-badge" :class="statusClass">
                  <span class="status-dot"></span>
                  {{ statusLabel }}
                </span>
                <span class="category-badge">{{ task.categoryName }}</span>
              </div>
              <h1 class="detail-title">{{ task.title }}</h1>
              <div class="header-meta">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatTime(task.publishedAt) }}
                </span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ task.location || '不限地点' }}
                </span>
              </div>
            </div>

            <div class="detail-card">
              <h3 class="card-section-title">需求详情</h3>
              <p class="description">{{ task.description }}</p>
            </div>
            <div class="detail-card review-display-card" v-if="reviewDetail">
              <h3 class="card-section-title">评价信息</h3>
              <div class="review-content">
                <div class="score-display">
                  <span class="label">服务评分：</span>
                  <el-rate v-model="reviewDetail.score" disabled show-score text-color="#ff9900" />
                </div>
                <div class="comment-display">
                  <p v-if="reviewDetail.comment" class="comment-text">"{{ reviewDetail.comment }}"</p>
                  <p v-else class="comment-text empty">该用户没有留下文字评价。</p>
                </div>
                <div class="review-time">
                  评价时间：{{ formatTime(reviewDetail.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-sidebar">
            <div class="reward-card">
              <span class="reward-label">任务报酬</span>
              <div class="reward-amount" v-if="task.reward">
                <span class="currency">¥</span>
                <span class="amount">{{ task.reward }}</span>
              </div>
              <div class="reward-amount free" v-else>免费互助</div>
            </div>

            <div class="publisher-card" v-if="task.publisher">
              <h4>发布者</h4>
              <div class="publisher-info">
                <div class="publisher-avatar">
                  <span class="avatar-placeholder">{{ task.publisher.nickname?.charAt(0) || 'U' }}</span>
                </div>
                <div class="publisher-details">
                  <span class="publisher-name">{{ task.publisher.nickname }}</span>
                  <span class="publisher-meta">信用分 {{ task.publisher.creditScore ?? 100 }}</span>
                </div>
              </div>
            </div>

            <div class="reward-card" v-if="userStore.isRequester && ['in_progress', 'completed'].includes(task.status) && task.reward > 0 && orderDetail?.paymentCode">
              <span class="reward-label" style="color: #b45309; font-weight: 600;">服务方收款码</span>
              <div style="text-align: center; margin-top: 12px;">
                <img :src="'http://localhost:8080' + orderDetail.paymentCode" style="max-width: 100%; max-height: 220px; border-radius: var(--radius-md); border: 1px solid var(--border-color); padding: 4px; background: #fff;" />
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">请使用微信或支付宝扫描上方二维码支付任务报酬</p>
              </div>
            </div>

            <div class="action-buttons">
              <button
                  v-if="userStore.isProvider && task.status === 'published'"
                  class="accept-btn"
                  :loading="actionLoading"
                  @click="handleAccept"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                立即接单
              </button>

              <template v-if="userStore.isRequester && task.publisher?.userId === userStore.userId">
                <button
                    v-if="task.status === 'in_progress'"
                    class="complete-btn"
                    :loading="actionLoading"
                    @click="handleComplete"
                >
                  确认完成
                </button>
                <button
                    v-if="['published', 'in_progress'].includes(task.status)"
                    class="cancel-btn"
                    :loading="actionLoading"
                    @click="handleCancel"
                >
                  取消需求
                </button>
                <button
                    v-if="task.status === 'completed' && canShowReview && !reviewDetail"
                    class="review-btn"
                    @click="openReviewDialog"
                >
                  评价服务方
                </button>
              </template>

              <p v-if="userStore.isProvider && task.status === 'published'" class="action-hint">
                接单后订单进入进行中状态
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <ReviewDialog
        v-model:visible="reviewVisible"
        :orderId="currentOrderId"
        @submitted="handleReviewSubmitted"
    />

    <el-dialog v-model="uploadDialogVisible" title="上传收款码" width="420px" append-to-body destroy-on-close>
      <div style="text-align: center; padding: 10px 0;">
        <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;">该需求为有偿任务，接单前请上传您的微信或支付宝收款码图片：</p>

        <el-upload
            class="payment-uploader"
            action="/v1/files/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
        >
          <img v-if="uploadedPaymentUrl" :src="'http://localhost:8080' + uploadedPaymentUrl" style="max-width: 180px; max-height: 180px; border: 1px solid var(--border-color); padding: 6px; background: #fff;" />
          <div v-else style="width: 180px; height: 180px; border: 2px dashed var(--border-color); display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; margin: 0 auto; border-radius: var(--radius-md);">
            <el-icon style="font-size: 28px; color: var(--text-muted);"><Plus /></el-icon>
            <span style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">点击上传图片</span>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!uploadedPaymentUrl" :loading="actionLoading" @click="confirmAccept">确认接单</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import taskApi from '@/task/taskApi'
import orderApi from '@/order/orderApi'
import { useUserStore } from '@/user/userStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ReviewDialog from '@/review/reviewDialog.vue'
import reviewApi from '@/review/reviewApi'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const actionLoading = ref(false)
const task = ref(null)
const reviewVisible = ref(false)
const currentOrderId = ref(null)
const lastOrderId = ref(null)

// 收款码相关变量
const uploadDialogVisible = ref(false)
const uploadedPaymentUrl = ref('')
const orderDetail = ref(null)
const reviewDetail = ref(null)

const statusMap = {
  published: ['待接单', 'published'],
  in_progress: ['进行中', 'in-progress'],
  completed: ['已完成', 'completed'],
  cancelled: ['已取消', 'cancelled']
}

const statusLabel = computed(() => task.value ? (statusMap[task.value.status]?.[0] || task.value.status) : '')
const statusClass = computed(() => task.value ? (statusMap[task.value.status]?.[1] || 'default') : 'default')

const canShowReview = computed(() => task.value ? task.value.hasReview : false)
const uploadHeaders = computed(() => {
  return {
    'Authorization': userStore.token ? `Bearer ${userStore.token}` : '',
    'X-User-Id': userStore.userId || ''
  }
})

// 2. 补充一个上传失败的回调，方便你在界面上看到报错原因
function handleUploadError(err) {
  console.error(err)
  ElMessage.error('图片上传失败，请检查网络或后端接口')
  actionLoading.value = false
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const res = await taskApi.getById(route.params.id)
    task.value = res.data.data

    // 修改：让需求方和服务方在进入进行中/已完成时都去获取订单信息，如果有评价则顺带拉取评价
    if (['in_progress', 'completed'].includes(task.value.status)) {
      try {
        const orderRes = await orderApi.getByTaskId(task.value.id)
        orderDetail.value = orderRes.data?.data

        // 已完成的话，尝试查询评价
        if (task.value.status === 'completed' && orderDetail.value?.orderId) {
          const reviewRes = await reviewApi.getByOrderId(orderDetail.value.orderId)
          reviewDetail.value = reviewRes.data?.data
        }
      } catch (err) {
        console.warn('获取订单详情/评价失败', err)
      }
    }
  } finally {
    loading.value = false
  }
})

async function handleAccept() {
  // 如果任务报酬大于0，拦截接单并打开上传收款码弹窗
  if (task.value.reward && task.value.reward > 0) {
    uploadedPaymentUrl.value = ''
    uploadDialogVisible.value = true
    return
  }

  // 免费任务，直接调用接单接口
  executeAcceptApi('')
}

async function executeAcceptApi(paymentCode) {
  actionLoading.value = true
  try {
    // 确保你的 orderApi.accept 支持接收 paymentCode 字段
    const res = await orderApi.accept(task.value.id, paymentCode)
    lastOrderId.value = res.data?.data?.orderId
    ElMessage.success('接单成功！需求已进入进行中')
    task.value.status = 'in_progress'
    uploadDialogVisible.value = false
  } finally {
    actionLoading.value = false
  }
}

function confirmAccept() {
  if (!uploadedPaymentUrl.value) return
  executeAcceptApi(uploadedPaymentUrl.value)
}

function handleUploadSuccess(res) {
  // 注意：这里的 res.data.url 需根据你后端的实际返回值调整
  if (res && res.data && res.data.url) {
    uploadedPaymentUrl.value = res.data.url
    ElMessage.success('收款码上传成功')
  } else {
    ElMessage.error('图片解析失败，请重试')
  }
}

function beforeUpload(file) {
  const isJPGorPNG = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('上传收款码图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传收款码图片大小不能超过 2MB!')
  }
  return isJPGorPNG && isLt2M
}

async function handleComplete() {
  try {
    await ElMessageBox.confirm('确认该需求已完成？', '确认完成')
    actionLoading.value = true

    if (!lastOrderId.value) {
      try {
        const res = await orderApi.getByTaskId(task.value.id)
        if (res.data && res.data.data && res.data.data.orderId) {
          lastOrderId.value = res.data.data.orderId
        }
      } catch (e) {
        console.warn('获取订单失败', e)
      }
    }

    if (!lastOrderId.value) {
      ElMessage.warning('未能获取到对应订单，请到「我的订单」中处理')
      actionLoading.value = false
      return
    }

    await orderApi.complete(lastOrderId.value)
    ElMessage.success('已确认完成')
    task.value.status = 'completed'
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  } finally {
    actionLoading.value = false
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确定要取消吗？', '取消需求', { type: 'warning' })
    actionLoading.value = true

    if (!lastOrderId.value && task.value.status === 'in_progress') {
      try {
        const res = await orderApi.getByTaskId(task.value.id)
        if (res.data && res.data.data && res.data.data.orderId) {
          lastOrderId.value = res.data.data.orderId
        }
      } catch (e) {
        console.warn('获取订单失败', e)
      }
    }

    if (lastOrderId.value) {
      await orderApi.cancel(lastOrderId.value)
      ElMessage.success('已取消')
      task.value.status = 'cancelled'
    } else {
      await taskApi.deleteTask(task.value.id)
      ElMessage.success('已删除需求')
      router.push('/')
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  } finally {
    actionLoading.value = false
  }
}

async function openReviewDialog() {
  if (!lastOrderId.value) {
    try {
      const res = await orderApi.getByTaskId(task.value.id)
      if (res.data && res.data.data && res.data.data.orderId) {
        lastOrderId.value = res.data.data.orderId
      }
    } catch (e) {
      console.warn('获取订单失败', e)
    }
  }

  if (!lastOrderId.value) {
    ElMessage.warning('未能获取到对应订单信息，请到「我的订单」中评价')
    return
  }

  currentOrderId.value = lastOrderId.value
  reviewVisible.value = true
}

async function handleReviewSubmitted() {
  ElMessage.success('评价已提交，感谢反馈！')
  if (currentOrderId.value) {
    const reviewRes = await reviewApi.getByOrderId(currentOrderId.value)
    reviewDetail.value = reviewRes.data?.data
  }
}
</script>

<style scoped>
.task-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
  margin-bottom: 20px;
}

.back-btn:hover {
  background: var(--bg-tertiary);
  color: var(--primary);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.detail-container {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .detail-container {
    grid-template-columns: 1fr;
  }
}

.detail-main {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
  position: relative;
}

.detail-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
}

.detail-header {
  padding: 32px;
  border-bottom: 1px solid var(--border-color);
}

.header-top {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-dark);
}
.status-badge.in-progress { background: rgba(245, 158, 11, 0.1); color: var(--accent-dark); }
.status-badge.completed { background: rgba(34, 197, 94, 0.1); color: #15803d; }
.status-badge.cancelled { background: var(--bg-tertiary); color: var(--text-muted); }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.category-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.detail-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px;
  line-height: 1.4;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
}
.meta-item svg { width: 16px; height: 16px; }

.detail-card {
  padding: 32px;
}

.card-section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
  margin: 0;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reward-card, .publisher-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.reward-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.reward-amount {
  color: var(--accent);
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.reward-amount .currency { font-size: 20px; }
.reward-amount .amount { font-size: 36px; line-height: 1; }
.reward-amount.free { font-size: 24px; color: var(--text-muted); }

.publisher-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--text-primary);
}

.publisher-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.publisher-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.publisher-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.publisher-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.publisher-meta { font-size: 13px; color: var(--text-muted); }

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons button {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.action-buttons button svg { width: 20px; height: 20px; }

.accept-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}
.accept-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.complete-btn { background: var(--success); color: white; }
.complete-btn:hover { background: #15803d; }
.review-btn { background: var(--primary); color: white; }
.review-btn:hover { opacity: 0.9; }

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.cancel-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.action-hint {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* 新增：评价展示区样式 */
.review-display-card {
  border-top: 1px solid var(--border-color);
  background-color: rgba(245, 158, 11, 0.02);
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-display .label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-display {
  background: var(--bg-primary);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.comment-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.comment-text.empty {
  color: var(--text-muted);
  font-style: normal;
}

.review-time {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}
</style>