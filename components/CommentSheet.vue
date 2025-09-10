<template>
    <!-- Popup 弹出层 -->
  <u-popup :show="show" @close="closeSheet" mode="bottom" :round="10">
    <view class="comment-sheet">
      <!-- 头部 -->
      <view class="sheet-header">
        <text class="title">{{ commentCount }}条评论</text>
        <u-icon name="close" size="18" @click="closeSheet"></u-icon>
      </view>

      <!-- 评论列表 -->
      <scroll-view scroll-y class="comment-list-scroll" @scrolltolower="loadMoreComments">
        <view v-if="loading && page === 1" class="loading-state">
          <u-loading mode="circle" color="#2979ff"></u-loading>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- <view v-else-if="comments.length === 0" class="empty-state">
          <u-empty mode="comment" text="暂无评论，快来抢沙发吧~"></u-empty>
        </view> -->

        <view v-else class="comment-list">
          <view v-for="comment in comments" :key="comment.id" class="comment-item">
            <u-avatar :src="comment.userAvatarUrl || '/static/img/我的.png'" size="50"></u-avatar>
            <view class="comment-content">
              <view class="comment-header">
                <text class="username">{{ comment.userNickName || '匿名用户' }}</text>
                <text class="time">{{ formatTime(comment.publishTime) }}</text>
              </view>

              <text class="text">{{ comment.content }}</text>

              <view class="comment-actions">
                <view class="action-icon" @tap="toggleSubComments(comment)">
                  <image src="/static/img/评论.svg" mode="aspectFit" class="icon-image" ></image>
                  <text>{{ comment.subCommentNumber || 0 }}</text>
                </view>
                <view class="action-icon" @tap="pleasewait">
                  <image :src="comment.isLiked ? '/static/img/点赞-active.svg' : '/static/img/点赞.svg'" mode="aspectFit" class="icon-image"></image>
                  <text :class="{ 'text-primary': comment.isLiked }">{{ comment.likeNumber || 0 }}</text>
                </view>
              </view>
			  
			  
			                <view v-if="comment.showSub" class="sub-comment-list">
			                  <view v-if="comment.loadingSub" class="loading-state">
			                    <u-loading mode="circle" color="#2979ff"></u-loading>
			                    <text class="loading-text">加载子评论...</text>
			                  </view>
			                  <view v-else>
			                    <view v-for="sub in comment.subComments" :key="sub.id" class="sub-comment">
			                      <text class="sub-comment-user">{{ sub.userNickName || '森林小熊' }}</text>
			                      <text class="sub-comment-content">{{ sub.content }}</text>
			                    </view>
			                  </view>
			                </view>
              
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部输入框 -->
      <view class="comment-input-area">
        <u--input v-model="newComment" placeholder="说点什么吧..." border="surround" @confirm="commentArticle"
          :adjustPosition="false" :customStyle="{
            backgroundColor: '#ffffff',
            borderRadius: '9rpx',
            padding: '20 20rpx'
          }"></u--input>
        <u-button type="primary" size="small" @click="commentArticle" :disabled="!newComment.trim()"></u-button>    
      </view>
    </view>

    <!-- 添加子评论弹窗组件 -->
    <sub-comment-sheet
      :show="showSubComment"
      :comment-id="currentCommentId"
      :article-id="articleId"
      @update:show="showSubComment = $event"
      @close="showSubComment = false"
      @refresh="refreshComments"
    />
  </u-popup>
</template>

<script>
import SubCommentSheet from './SubCommentSheet.vue'

export default {
  name: 'CommentSheet',
  components: {
    SubCommentSheet
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    articleId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      comments: [],   //评论数组
      loading: false,
      page: 1,
      hasMore: true,
      commentCount: 0,
      newComment: '',
      showSubComment: false,
      currentCommentId: null,
	  subLoadingMap: {},
    };
  },
  
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }
      // 小于1小时
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 小于24小时
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      // 小于30天
      if (diff < 2592000000) {
        return Math.floor(diff / 86400000) + '天前';
      }
      // 大于30天显示具体日期
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    replyComment(comment) {
      // 处理回复评论的逻辑
      this.newComment = `@${comment.userNickName} `;
    },
    // 加载评论方法
    loadComments() {
      if (this._loadingComments) {
        console.log('已有加载请求进行中，跳过');
        return;
      }
      
      this._loadingComments = true;
      this.comments = [];
      this.page = 1;
      this.hasMore = true;
      this.commentCount = 0;
      this.loading = true;
      
      console.log('开始加载评论，文章ID:', this.articleId);
      this.fetchComments();
    },
    
   
    fetchComments() {
      this.loading = true; // 设置加载状态
      console.log('发送评论请求，页码:', this.page, '文章ID:', this.articleId);
      
      return uni.$u.get(`/article/findCommentByPage`, {
        pageNum: this.page, //当前页码  
        pageSize: 5, //每页显示的条数
        articleId: this.articleId //文章id
      }).then(res => {
        if (res.success) {
          console.log('获取评论成功，数量:', res.data.content ? res.data.content.length : 0);
          const newComments = (res.data.content || []).map(comment => ({
            id: comment.id,
            userId: comment.userId,
            publishTime: comment.publishTime,
            content: comment.content,
            userNickName: comment.userNickName,
            userAvatarUrl: comment.userAvatarUrl,
            subCommentFlag: comment.subCommentFlag,
            subCommentUserNickName: comment.subCommentUserNickName,
            subCommentContent: comment.subCommentContent,
            subCommentNumber: comment.subCommentNumber,
            likeNumber: comment.likeNumber || 0,
            isLiked: comment.isLiked || false,
            showSub: false,
            loadingSub: false,
            subComments: []
          }));
          
          if (this.page === 1) {
            this.comments = newComments;
          } else {
            this.comments = [...this.comments, ...newComments];
          }
          
          this.hasMore = newComments.length === 5;
          this.page++;
          this.commentCount = res.data.total || this.comments.length;
		  
		  // 通知父页面用后端总数刷新文章卡片的评论数
          this.$emit('update-comment-count', { articleId: this.articleId, count: this.commentCount });
        } else {
          console.error('获取评论失败:', res.msg);
          uni.showToast({
            title: '获取评论失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('获取评论异常:', err);
        uni.showToast({
          title: '获取评论失败',
          icon: 'none'
        });
      }).finally(() => {
        this.loading = false; // 无论成功失败都关闭加载状态
        this._loadingComments = false; // 重置加载标记
      });
    },
	
	async toggleSubComments(comment) {
	      comment.showSub = !comment.showSub;
	      if (comment.showSub && comment.subComments.length === 0) {
	        comment.loadingSub = true;
	        try {
	          const res = await uni.$u.get('/article/listSubComments', { commentId: comment.id });
	          if (res.success) {
	            comment.subComments = res.data || [];
	          }
	        } catch (e) {
	          console.error('加载子评论失败', e);
	        } finally {
	          comment.loadingSub = false;
	        }
	      }
	    },
    
    closeSheet() {
      console.log('关闭评论弹窗');
      this.$emit('close');
    },

    loadMoreComments() {
      if (this.loading || !this.hasMore) return;  //没有更多评论返回
      this.fetchComments();
    },

    //刷新评论列表
    refreshComments() {
      // 重置页码
      this.page = 1;
      // 重新获取评论列表
      this.fetchComments();
    },

    commentArticle() {
      if (!this.newComment.trim()) return;

      uni.$u.post('/article/commentArticle', {
        articleId: this.articleId,
        content: this.newComment.trim()
      }).then(res => {
        if (res.success) {
          uni.showToast({
            title: '评论成功',
            icon: 'success'
          });
          // 清空输入框
          this.newComment = '';
          // 重新加载评论列表
          this.page = 1;
          this.hasMore = true;
          this.fetchComments();
        } else {
          uni.showToast({
            title: res.msg || '评论失败',
            icon: 'none'
          });
        }
      })
    },

    likeComment(comment) {
      uni.$u.post('/article/likeComment', {
        commentId: comment.id
      }).then(res => {
        if (res.success) {
          // 更新评论点赞状态
          const index = this.comments.findIndex(item => item.id === comment.id);
          if (index !== -1) {
            this.comments[index].isLiked = !this.comments[index].isLiked;
            this.comments[index].likeNumber = this.comments[index].isLiked
              ? (parseInt(this.comments[index].likeNumber || 0) + 1).toString()
              : Math.max(0, parseInt(this.comments[index].likeNumber || 0) - 1).toString();
          }

          uni.showToast({
            title: this.comments[index].isLiked ? '点赞成功' : '已取消点赞',
            icon: 'none'
          });

          // 重新获取评论列表，确保数据与后端同步
          this.page = 1;
          this.hasMore = true;
          this.fetchComments();
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      }).catch(error => {
        console.error('点赞操作失败:', error);
        uni.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none'
        });
      });
    },
   

    //进入子评论页面  
    enterSubCommentPage(comment) {
      this.currentCommentId = comment.id
      this.showSubComment = true
    },

    pleasewait() {
            uni.showToast({
                title: '敬请期待!',
                icon: 'none',
                duration: 2000
            });
        }

  
  },

  // 在组件内部添加监听逻辑
  watch: {
    show(newVal) {
      console.log('评论弹窗显示状态变化:', newVal, '文章ID:', this.articleId);
      if (newVal && this.articleId) {
        // 防止重复请求
        if (!this._requestInProgress) {
          this._requestInProgress = true;
          console.log('弹窗显示，加载评论，articleId:', this.articleId);
          
          // 添加延迟，避免快速连续触发
          setTimeout(() => {
            if (this.show) { // 再次检查弹窗是否仍然显示
              this.loadComments();
            }
            this._requestInProgress = false;
          }, 100);
        } else {
          console.log('请求已在进行中，跳过重复请求');
        }
      }
    },
    // 监听文章ID变化
    articleId: {
      handler(newVal, oldVal) {
        console.log('文章ID变化:', oldVal, '->', newVal);
        if (newVal && newVal !== oldVal && this.show) {
          // 重新加载评论
          console.log('文章ID变化，重新加载评论');
          this.loadComments();
        }
      },
      immediate: false // 组件创建时不触发
    }
  },
  
  // 挂载函数，不再自动调用fetchComments
  mounted() {
    console.log('CommentSheet组件已挂载，articleId:', this.articleId);
    // 不再自动调用fetchComments，由watch监听show变化时触发
  }
}
</script>

<style lang="scss" scoped>
.comment-sheet {
  height: 77vh; // 占据屏幕75%的高度
  display: flex;
  border-top-left-radius: 65rpx;    /* 左上角圆角 */
  border-top-right-radius: 65rpx;   
  border-bottom-left-radius: 0;     
  border-bottom-right-radius: 0; 

  border-bottom: 4rpx solid #e0e0e0; // 明显的灰色横线
  flex-direction: column;
  background-color: #fff;

  .sheet-header {
    display: flex;
    justify-content: center; // 居中标题
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    position: relative; // 为关闭按钮绝对定位提供基准

    .title {
      font-size: 30rpx;
      font-weight: 500;
      color: #303133;
      text-align: center; // 确保文字居中
      flex: 1; // 占据空间使其可居中
    }

    .u-icon[name="close"] {
      // 更精确地选择关闭图标
      position: absolute; // 绝对定位到右上角
      right: 30rpx;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .comment-list-scroll {
    flex: 1; // 占据剩余空间
    overflow-y: auto;
    border-bottom: 4rpx solid #e0e0e0; // 明显的灰色横线
    .loading-state,
    .empty-state {
      text-align: center;
      color: #909399;
      padding: 60rpx 0; // 增加上下间距
      font-size: 28rpx;
    }
    .comment-list {
      padding: 0 30rpx;
    }
    .comment-item {
      display: flex;
      padding: 30rpx 0;
      border-bottom: 4rpx solid #eeecec; // 明显的灰色横线
      &:last-child {
        border-bottom: none;
      }
      .avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        margin-right: 32rpx; // 增大头像和名字的距离
        flex-shrink: 0;
      }
      .comment-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0; // 防止内容撑开
        .comment-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 8rpx;
          .username {
            
            font-size: 28rpx;
            color: #68696a;
            font-weight: 500;
            margin-left: 30rpx; // 名字向右移动
          }
          .time {
            font-size: 24rpx;
            color: #909399;
            margin-left: 24rpx;
          }
        }
        .text {
          font-size: 30rpx;
          color: #575859;
          line-height: 1;
          margin-left: 29rpx;
          margin-bottom: 16rpx; // 增大文字和下方图标的间距
          word-break: break-word;
        }
        .comment-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          .action-icon {
            display: flex;
            align-items: center;
            gap: 6rpx;
            margin-left: 30rpx;
            padding: 10rpx; // 增加点击区域
            .icon-image {
              width: 36rpx;
              height: 36rpx;
            }
            text {
              font-size: 24rpx;
              color: #909399;
              margin-left: 4rpx;
            }
          }
        }
      }
    }
  }

  .comment-input-area {
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 52rpx 20rpx 30rpx 10rpx; // 向上移动并减少底部间距
    background-color: #fcfbfb;
    border-top: 1rpx solid #f0f0f0; // 统一边框颜色
   
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
    margin-bottom: 32rpx; // 整体输入框向上移动
    .u--input {
      flex: 1;
      background-color: #ffffff; 
     
      padding: 0 20rpx !important; // 增加内部padding, 可能需要!important

      /deep/ .u-input__content__field-wrapper__field {
        // 调整placeholder样式
        font-size: 28rpx;
        height: 60rpx; // 控制输入框高度
        line-height: 60rpx;
      }
      /deep/ .u-input__content__field-wrapper ::-webkit-input-placeholder {
        color: #9ba41d;
      }

      /deep/ .u-input__content__field-wrapper ::-moz-placeholder {
        color: #c0c4cc;
      }
      /deep/ .u-input__content__field-wrapper :-ms-input-placeholder {
        color: #c0c4cc;
      }
      /deep/ .u-input__content__field-wrapper ::placeholder {
        color: #c0c4cc;
      }
    }
    .u-button {
      display: none;
    }
  }
}

.sub-comment {
  margin-top: 10rpx;
  padding: 10rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;

  .sub-comment-user {
    color: #576b95;
    font-size: 24rpx;
    margin-right: 10rpx;
  }

  .sub-comment-content {
    color: #666;
    font-size: 24rpx;
  }
}

.text-primary {
  color: #2979ff;
}
</style>