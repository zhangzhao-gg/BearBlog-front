<template>
	<view class="comment-detail">
		<!-- 主评论 -->
		<view class="main-comment">
			<view class="comment-item">
				<u-avatar :src="mainComment.userAvatarUrl || '/static/img/我的.png'" size="64"></u-avatar>
				<view class="comment-content">
					<view class="comment-header">
						<text class="username">{{ mainComment.userNickName || '匿名用户' }}</text>
						<text class="time">{{ formatTime(mainComment.publishTime) }}</text>
					</view>
					<text class="text">{{ mainComment.content }}</text>
					<view class="comment-actions">
						<view class="action-icon">
							<image src="/static/img/评论.svg" mode="aspectFit" class="icon-image"></image>
							<text>{{ mainComment.subCommentNumber || 0 }}</text>
						</view>
						<view class="action-icon" @tap="likeComment(mainComment)">
							<image :src="mainComment.isLiked ? '/static/img/点赞-active.svg' : '/static/img/点赞.svg'"
								mode="aspectFit" class="icon-image"></image>
							<text
								:class="{ 'text-primary': mainComment.isLiked }">{{ mainComment.likeNumber || 0 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 子评论列表 -->
		<scroll-view scroll-y class="sub-comments-scroll" @scrolltolower="loadMoreSubComments">
			<view class="sub-comments-title">全部回复</view>
			<view v-if="loading && page === 1" class="loading-state">
				<u-loading mode="circle" color="#2979ff"></u-loading>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else-if="subComments.length === 0" class="empty-state">
				<u-empty mode="comment" text="暂无回复，快来参与讨论吧~"></u-empty>
			</view>
			<view v-else class="sub-comments-list">
				<view v-for="comment in subComments" :key="comment.id" class="comment-item">
					<u-avatar :src="comment.userAvatarUrl || '/static/img/我的.png'" size="64"></u-avatar>
					<view class="comment-content">
						<view class="comment-header">
							<text class="username">{{ comment.userNickName || '匿名用户' }}</text>
							<text class="time">{{ formatTime(comment.publishTime) }}</text>
						</view>
						<text class="text">{{ comment.content }}</text>
						<view class="comment-actions">
							<view class="action-icon" @tap="likeComment(comment)">
								<image :src="comment.isLiked ? '/static/img/点赞-active.svg' : '/static/img/点赞.svg'"
									mode="aspectFit" class="icon-image"></image>
								<text :class="{ 'text-primary': comment.isLiked }">{{ comment.likeNumber || 0 }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部输入框 -->
		<view class="comment-input-area">
			<u--input v-model="newComment" placeholder="说点什么吧..." border="surround" @confirm="submitSubComment"
				:adjustPosition="false" :customStyle="{
          backgroundColor: '#f8f8f8',
          borderRadius: '30rpx',
          padding: '0 20rpx'
        }"></u--input>
			<u-button type="primary" size="small" @click="submitSubComment" :disabled="!newComment.trim()"
				customStyle="margin-left: 20rpx">发送</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				commentId: '',
				articleId: '',
				mainComment: {},
				subComments: [],
				loading: false,
				page: 1,
				hasMore: true,
				newComment: '',
			}
		},
		onLoad(options) {
			this.commentId = options.commentId
			this.articleId = options.articleId
			this.fetchMainComment()
			this.fetchSubComments()
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

			fetchMainComment() {
				uni.$u.get(`/coment/getCommentDetail/${this.commentId}`).then(res => {
					if (res.success) {
						this.mainComment = res.data
					}
				})
			},

			fetchSubComments() {
				if (this.loading || !this.hasMore) return
				this.loading = true

				uni.$u.get('/coment/getSubComments', {
					commentId: this.commentId,
					pageNum: this.page,
					pageSize: 10
				}).then(res => {
					if (res.success) {
						const newComments = res.data.content || []
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

			submitSubComment() {
				if (!this.newComment.trim()) return

				uni.$u.post('/comment/commentToComment', {
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
					} else {
						uni.showToast({
							title: res.msg || '评论失败',
							icon: 'none'
						})
					}
				})
			},

			likeComment(comment) {
				uni.$u.post('/comment/likeComment', {
					commentId: comment.id
				}).then(res => {
					if (res.success) {
						comment.isLiked = !comment.isLiked
						comment.likeNumber = comment.isLiked ?
							(parseInt(comment.likeNumber || 0) + 1).toString() :
							Math.max(0, parseInt(comment.likeNumber || 0) - 1).toString()

						uni.showToast({
							title: comment.isLiked ? '点赞成功' : '已取消点赞',
							icon: 'none'
						})
					}
				})
			},

			loadMoreSubComments() {
				if (!this.loading && this.hasMore) {
					this.fetchSubComments()
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comment-detail {
		min-height: 100vh;
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;

		.main-comment {
			background-color: #fff;
			padding: 30rpx;
			margin-bottom: 20rpx;
		}

		.sub-comments-title {
			padding: 20rpx 30rpx;
			font-size: 28rpx;
			color: #909399;
			background-color: #fff;
			border-bottom: 1rpx solid #f0f0f0;
		}

		.sub-comments-scroll {
			flex: 1;
			background-color: #fff;
		}

		.comment-item {
			display: flex;
			padding: 30rpx;
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
					margin-bottom: 10rpx;

					.username {
						font-size: 28rpx;
						color: #303133;
						font-weight: 500;
					}

					.time {
						font-size: 24rpx;
						color: #909399;
					}
				}

				.text {
					font-size: 30rpx;
					color: #303133;
					line-height: 1.6;
					margin-bottom: 16rpx;
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
						padding: 10rpx;

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

		.loading-state,
		.empty-state {
			text-align: center;
			padding: 60rpx 0;
			color: #909399;
		}

		.comment-input-area {
			padding: 20rpx;
			background-color: #fff;
			border-top: 1rpx solid #f0f0f0;
			display: flex;
			align-items: center;
			padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
			padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

			.u--input {
				flex: 1;
				background-color: #f8f8f8;
				border-radius: 30rpx;
			}
		}
	}

	.text-primary {
		color: #2979ff;
	}
</style>