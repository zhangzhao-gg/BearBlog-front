<template>
  <u-popup :show="show" @close="closeSheet" mode="bottom" :round="10">
    <view class="comment-sheet">
      <!-- 头部 -->
      <view class="sheet-header">
        <view class="header-left">
          <u-icon name="arrow-left" size="20" @click="closeSheet"></u-icon>
          <text class="title">评论详情</text>
        </view>
        <u-icon name="close" size="20" @click="closeSheet"></u-icon>
      </view>

      <!-- 全部回复标题 -->
      <view class="sub-comments-title">全部回复</view>

      <!-- 主评论 -->
      <view class="main-comment" v-if="mainComment">
        <view class="comment-item">
          <u-avatar :src="mainComment.userAvatarUrl || '/static/img/我的.png'" size="40"></u-avatar>
          <view class="comment-content">
            <view class="comment-header">
              <text class="username">{{ mainComment.userNickName || '匿名用户' }}</text>
            </view>
            <text class="text">{{ mainComment.content }}</text>
            <view class="comment-actions">
              <view class="action-icon">
                <image src="/static/img/评论.svg" mode="aspectFit" class="icon-image"></image>
                <text>{{ mainComment.subCommentNumber || 0 }}</text>
              </view>
              <view class="action-icon" @tap="likeComment(mainComment)">
                <image :src="mainComment.isLiked ? '/static/img/点赞-active.svg' : '/static/img/点赞.svg'" mode="aspectFit" class="icon-image"></image>
                <text :class="{ 'text-primary': mainComment.isLiked }">{{ mainComment.likeNumber || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 子评论列表 根据loading和 page判断展示内容-->
      <scroll-view scroll-y class="comment-list-scroll" @scrolltolower="loadMoreComments">
        <view v-if="loading && page === 1" class="loading-state">
          <u-loading mode="circle" color="#2979ff"></u-loading>
          <text class="loading-text">加载中...</text>
        </view>
        <view v-else-if="subComments.length === 0" class="empty-state">
          <image src="/static/img/empty-comment.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">暂无回复，快来参与讨论吧~</text>
        </view>

        <!--子评论列表展示内容-->
        <view v-else class="comment-list">
          <view v-for="comment in subComments" :key="comment.id" class="comment-item">
            <u-avatar :src="comment.userAvatarUrl || '/static/img/我的.png'" size="40"></u-avatar>
            <view class="comment-content">
              <view class="comment-header">
                <text class="username">{{ comment.userNickName || '匿名用户' }}</text>
              </view>
              <text class="text">
              
                {{ comment.content }}
              </text>
              <view class="comment-actions">
                <view class="action-icon" @tap="likeComment(comment)">
                  <image :src="comment.isLiked ? '/static/img/点赞-active.svg' : '/static/img/点赞.svg'" mode="aspectFit" class="icon-image"></image>
                  <text :class="{ 'text-primary': comment.isLiked }">{{ comment.likeNumber || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部输入框 -->
      <view class="comment-input-area">
        <u--input v-model="newComment"
         placeholder="说点什么吧..." 
         border="none"      
         @confirm="commentToComment"  
         :adjustPosition="false" 
         :customStyle="{
            backgroundColor: '#F5F5F5',
            borderRadius: '36rpx',
            padding: '20rpx 30rpx',
            fontSize: '28rpx'
          }"></u--input>
      </view>
    </view>
  </u-popup>
</template>

<script>
export default {
  name: 'SubCommentSheet',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    commentId: {
      type: [String, Number],
      default: ''
    },
    articleId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      mainComment: null,
      subComments: [],
      loading: false,
      page: 1,
      hasMore: true,
      newComment: ''
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.commentId) {
        this.page = 1
        this.hasMore = true
        this.fetchMainComment()
        this.fetchSubComments()
      }
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    //自定义事件
    closeSheet() {
      this.$emit('update:show', false)
      this.$emit('close')
    },

    fetchMainComment() {
      uni.$u.get(`/article/getCommentDetail/${this.commentId}`).then(res => {
        if (res.success) {
          this.mainComment = {
            id: res.data.id,
            userId: res.data.userId,
            publishTime: res.data.publishTime,
            content: res.data.content,
            userNickName: res.data.userNickName,
            userAvatarUrl: res.data.userAvatarUrl,
            subCommentNumber: res.data.subCommentNumber || 0,
            likeNumber: res.data.likeNumber || 0,
            isLiked: res.data.isLiked || false
          }
        }
      })
    },

    fetchSubComments() {
      if (this.loading || !this.hasMore) return
      this.loading = true
      
      uni.$u.get('/article/getSubComments', {
        commentId: this.commentId,
        pageNum: this.page,
        pageSize: 10
      }).then(res => {
        if (res.success) {
          const newComments = (res.data.content || []).map(comment => ({
            id: comment.id,
            userId: comment.userId,
            publishTime: comment.publishTime,
            content: comment.content,
            userNickName: comment.userNickName,
            userAvatarUrl: comment.userAvatarUrl,
            replyToUserNickName: comment.replyToUserNickName,
            likeNumber: comment.likeNumber || 0,
            isLiked: comment.isLiked || false
          }))

          if (this.page === 1) {
            this.subComments = newComments
          } else {
            this.subComments = [...this.subComments, ...newComments]
          }
          this.hasMore = newComments.length === 10
          this.page++
        }
      }).finally(() => {
        this.loading = false
      })
    },

    commentToComment() {
      if (!this.newComment.trim()) return

      uni.$u.post('/article/commentToComment', {
        commentId: this.commentId,
        content: this.newComment.trim()
      }).then(res => {
        if (res.success) {
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          })
          this.newComment = ''
          // 重新加载评论
          this.page = 1
          this.hasMore = true
          this.fetchSubComments()
          // 更新主评论的回复数
          this.fetchMainComment()
          // 通知父组件更新评论列表
          this.$emit('refresh')
        } else {
          uni.showToast({
            title: res.msg || '评论失败',
            icon: 'none'
          })
        }
      })
    },

    likeComment(comment) {
      uni.$u.post('/article/likeComment', {
        commentId: comment.id
      }).then(res => {
        if (res.success) {
          comment.isLiked = !comment.isLiked
          comment.likeNumber = comment.isLiked
            ? (parseInt(comment.likeNumber || 0) + 1).toString()
            : Math.max(0, parseInt(comment.likeNumber || 0) - 1).toString()

          uni.showToast({
            title: comment.isLiked ? '点赞成功' : '已取消点赞',
            icon: 'none'
          })
        }
      })
    },

    loadMoreComments() {
      if (!this.loading && this.hasMore) {
        this.fetchSubComments()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.comment-sheet {
  height: 75vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .header-left {
      display: flex;
      align-items: center;
      gap: 20rpx;
    }

    .title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }

  .sub-comments-title {
    padding: 20rpx 30rpx;
    font-size: 28rpx;
    color: #666;
    background-color: #fff;
    border-bottom: 1rpx solid #f5f5f5;
  }

  .main-comment {
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }

  .comment-list-scroll {
    flex: 1;
    overflow-y: auto;
  }

  .loading-state {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;

    .empty-image {
      width: 240rpx;
      height: 240rpx;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .comment-list {
    padding: 0 30rpx;
  }

  .comment-item {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .comment-content {
      flex: 1;
      margin-left: 20rpx;

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;

        .username {
          font-size: 28rpx;
          color: #333;
        }
      }

      .text {
        font-size: 30rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 16rpx;
        word-break: break-word;
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 8rpx;

        .action-icon {
          display: flex;
          align-items: center;
          padding: 8rpx 12rpx;

          .icon-image {
            width: 32rpx;
            height: 32rpx;
          }

          text {
            font-size: 24rpx;
            color: #999;
            margin-left: 8rpx;
          }
        }
      }
    }
  }

  .comment-input-area {
    padding: 20rpx 30rpx;
    background-color: #fff;
    border-top: 1rpx solid #f5f5f5;
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

    .u--input {
      background-color: #F5F5F5;
      border-radius: 36rpx;
      
      /deep/ .u-input__content__field-wrapper {
        padding: 0;
      }
    }
  }

  .reply-to {
    color: #2979ff;
    margin-right: 4rpx;
  }
}

.text-primary {
  color: #2979ff;
}
</style> 