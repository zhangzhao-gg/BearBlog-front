<template>
	<view class="user-root">
		<!-- 返回按钮 -->
		<view class="back-btn" @tap="goBack">
			<u-icon name="arrow-left" color="#fff" size="20"></u-icon>
		</view>


		<!-- 顶部背景图片 -->
		<image class="top-bg" src="/static/img/bg-boat.png" mode="aspectFill" />


		<!-- 覆盖式卡片 -->
		<view class="main-card">
			<view class="avatar-wrap">
				<u-avatar :src="userInfo.avatar || '/static/img/avatar-default.png'" size="90"
					customStyle="box-shadow: 0 4px 16px rgba(0,0,0,0.18);"></u-avatar>
			</view>
			<view class="card-header">
				<view class="user-info">
					<view class="nickname">{{ userInfo.nickname || '栖心用户2098' }}</view>
				</view>
				<image class="menu-btn" src="/static/img/更多.svg" mode="aspectFit" @tap="goToSetting" />
			</view>


			<view class="user-tabs">
				<view :class="['tab', { active: currentTab === 0 }]" @tap="currentTab = 0">
					消息
					<view v-if="unreadCount > 0" class="red-dot">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
				</view>
				<view :class="['tab', { active: currentTab === 1 }]" @tap="currentTab = 1">点赞</view>
				<view :class="['tab', { active: currentTab === 2 }]" @tap="pleasewait">浏览</view>
			</view>

			<view class="tab-underline">
				<view v-for="i in 3" :key="i" :class="['underline', { active: currentTab === i - 1 }]" />
			</view>

			<!-- 消息列表 -->
			<view v-if="currentTab === 0" class="message-list">
				<view v-if="messages.length === 0" class="empty-message">
					<image src="/static/img/logo.png" class="empty-icon" mode="aspectFit" />
					<text class="empty-text">暂无消息</text>
				</view>
				<view v-else>
					<view v-for="(message, index) in messages" :key="index" class="message-item"
						@tap="handleMessageTap(message)">
						<view class="message-avatar">
							<u-avatar :src="message.fromUserAvatar || '/static/img/avatar-default.png'"
								size="40"></u-avatar>
						</view>
						<view class="message-content">
							<view class="message-header">
								<text class="message-user">{{ message.fromUserName }}</text>
								<text class="message-time">{{ formatTime(message.createTime) }}</text>
							</view>
							<view class="message-text">
								<text v-if="message.type === 'like'">给您的文章《{{ message.articleTitle }}》点赞了</text>
								<text v-else-if="message.type === 'comment'">{{
                  message.commentContent }}</text>
							</view>
						</view>
						<view v-if="!message.isRead" class="unread-indicator"></view>
					</view>
				</view>
			</view>

			<!-- 点赞列表 -->
			<view v-if="currentTab === 1" class="like-list">
				<view v-for="(item, index) in likedArticles" :key="index" class="like-card">
					<image class="like-img" :src="item.img ? item.img : '/static/img/bg-boat.png'" mode="aspectFill" />
					<view class="like-content">
						<view class="like-title">{{ item.title }}</view>
						<view class="like-desc">{{ item.content }}</view>
					</view>
				</view>
			</view>
		</view>


	</view>
</template>

<script>
	import uAvatar from '../../uni_modules/uview-ui/components/u-avatar/u-avatar.vue'
	export default {
		components: {
			uAvatar
		},
		data() {
			return {
				currentTab: 1, // 默认显示点赞tab
				userInfo: {
					avatar: '',
					nickname: ''
				},
				likedArticles: [],
				messages: [], // 消息列表
				unreadCount: 0, // 未读消息数量
				websocket: false // WebSocket连接状态
			}
		},
		onLoad() {
			// 获取用户信息
			this.fetchUserInfo();
			// 获取用户点赞的文章
			this.fetchUserFavor();
			// 获取消息列表
			this.fetchMessages();
			// 初始化WebSocket连接
			this.initWebSocket();
		},

		onUnload() {
			// 页面卸载时关闭WebSocket连接
			if (this.websocket) {
				uni.closeSocket({
					code: 1000,
					reason: '页面关闭'
				});
			}
		},

		methods: {
			// 获取用户信息
			fetchUserInfo() {
				// 从本地存储获取用户ID
				const userId = uni.getStorageSync('accountId');
				if (!userId) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}

				// 发送请求获取用户信息
				uni.$u.get('/profile/getProfileInfo', {

				}).then(res => {
					if (res.code === 200 && res.data) {
						this.userInfo = {
							avatar: res.data.avator || '/static/img/avatar-default.png',
							nickname: res.data.nickName || '栖心用户' + userId.substring(userId.length - 4)
						};
					}
				})
			},
			// 获取个人界面点赞文章
			fetchUserFavor() {
				const userId = uni.getStorageSync('accountId');
				if (!userId) return;

				uni.$u.get('/profile/getLikedArticles', {

				}).then(res => {
					if (res.code === 200 && res.data) {
						this.likedArticles = res.data;
					}
				}).catch(err => {
					uni.showToast({
						title: '获取点赞信息失败',
						icon: 'none'
					});
				});
			},

			goToSetting() {
				uni.navigateTo({
					url: '/pages/setting/setting'
				});
			},
			pleasewait() {
				uni.showToast({
					title: '敬请期待!',
					icon: 'none',
					duration: 2000
				});
			},

			// 获取消息列表
			fetchMessages() {
				const userId = uni.getStorageSync('accountId');
				if (!userId) return;

				// 修改接口路径：getMessageList -> list
				uni.$u.get('/message/list', {}).then(res => {
					console.log('消息列表API响应:', res);
					if (res.code === 200 && res.data) {
						// 对后端数据进行字段映射
						this.messages = res.data.map(item => {
							return {
								id: item.id,
								type: item.type, // 直接使用type字段
								fromUserName: item.senderName || item.sender || '未知用户', // 优先使用senderName
								fromUserAvatar: item.senderAvatar || '/static/img/avatar-default.png',
								articleTitle: item.articleTitle,
								commentContent: item.content,
								createTime: new Date(item.createTime).getTime(),
								isRead: item.isRead,

							};
						});
						console.log('处理后的消息数据:', this.messages);
						// 计算未读消息数量
						this.unreadCount = this.messages.filter(msg => !msg.isRead).length;
					}
				}).catch(err => {
					console.error('获取消息列表失败:', err);
				});
			},

			// 初始化WebSocket连接
			initWebSocket() {
				const userId = uni.getStorageSync('accountId');
				if (!userId) return;

				const wsUrl = `ws://127.0.0.1:8080/ws/message/${userId}`;

				// 建立WebSocket连接
				uni.connectSocket({
					url: wsUrl,
					header: {
						'content-type': 'application/json'
					},
					method: 'GET',
					success: () => {
						console.log('WebSocket连接请求发送成功');
					},
					fail: (err) => {
						console.error('WebSocket连接失败:', err);
					}
				});

				// 监听WebSocket连接打开
				uni.onSocketOpen((res) => {
					console.log('WebSocket连接已打开:', res);
					this.websocket = true;
				});

				// 监听WebSocket消息
				uni.onSocketMessage((res) => {
					console.log('收到WebSocket消息:', res.data);
					try {
						const message = JSON.parse(res.data);
						// 添加新消息到列表顶部
						this.messages.unshift(message);
						// 更新未读消息数量
						this.unreadCount++;
						// 显示新消息提示
						uni.showToast({
							title: '收到新消息',
							icon: 'none',
							duration: 1500
						});
					} catch (err) {
						console.error('解析WebSocket消息失败:', err);
					}
				});

				// 监听WebSocket连接关闭
				uni.onSocketClose((res) => {
					console.log('WebSocket连接已关闭:', res);
					this.websocket = false;
				});

				// 监听WebSocket错误
				uni.onSocketError((err) => {
					console.error('WebSocket错误:', err);
					this.websocket = false;
				});
			},

			// 处理消息点击,跳转到对应文章
			handleMessageTap(message) {
				// 标记消息为已读
				if (!message.isRead) {
					this.markMessageAsRead(message.id);
					message.isRead = true;
					this.unreadCount = Math.max(0, this.unreadCount - 1);
				}

				// 根据消息类型跳转到相应页面
				if (message.type === 'like' || message.type === 'comment') {
					// 跳转到文章详情页
					uni.navigateTo({
						url: `/pages/article/article?articleId=${message.articleId}`
					});
				}
			},

			// 标记消息为已读
			markMessageAsRead(messageId) {
				uni.$u.post('/message/markAsRead', {
					messageId: messageId
				}).catch(err => {
					console.error('标记消息已读失败:', err);
				});
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';

				const now = new Date();
				const messageTime = new Date(timestamp);
				const diff = now.getTime() - messageTime.getTime();

				// 小于1分钟
				if (diff < 60 * 1000) {
					return '刚刚';
				}
				// 小于1小时
				if (diff < 60 * 60 * 1000) {
					return Math.floor(diff / (60 * 1000)) + '分钟前';
				}
				// 小于1天
				if (diff < 24 * 60 * 60 * 1000) {
					return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
				}
				// 小于7天
				if (diff < 7 * 24 * 60 * 60 * 1000) {
					return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
				}
				// 超过7天显示具体日期
				return messageTime.toLocaleDateString();
			},

			// 返回上一页
			goBack() {
				uni.navigateTo({
					url: '/pages/article/article?id=1'
				});
			},
		},
	}
</script>

<style lang="scss" scoped>
	/* 返回按钮样式 */
	.back-btn {
		position: fixed;
		top: 44rpx;
		left: 32rpx;
		z-index: 10;
		width: 80rpx;
		height: 80rpx;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
		transition: all 0.3s ease;

		&:active {
			transform: scale(0.9);
			background: rgba(0, 0, 0, 0.5);
		}
	}

	.user-root {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background: #f8f8f8;
	}

	/* 返回箭头样式 */
	.back-arrow {
		position: fixed;
		top: 44rpx;
		left: 32rpx;
		z-index: 10;
		width: 80rpx;
		height: 80rpx;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
		transition: all 0.3s ease;

		.arrow-icon {
			color: #fff;
			font-size: 48rpx;
			font-weight: bold;
			line-height: 1;
			margin-left: -4rpx;
			/* 微调居中 */
		}

		&:active {
			transform: scale(0.9);
			background: rgba(0, 0, 0, 0.5);
		}
	}

	.top-bg {
		width: 100vw;
		height: 30vh;
		// min-height: 260rpx;
		// max-height: 360rpx;
		object-fit: cover;
		display: block;
	}

	// .main-card {
	//   position: absolute;
	//   left: 0;
	//   right: 0;
	//   top: 27vh;
	//   width: 95vw;
	//   min-height: 68vh;
	//   background: #fff;
	//   border-radius: 48rpx;
	//   box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
	//   z-index: 2;
	//   padding: 24rpx;
	//   padding-top: 90rpx; /* 为头像预留空间 */
	//   display: flex;
	//   flex-direction: column;
	// }


	.main-card {
		position: absolute;
		left: 0;
		right: 0;
		top: 27vh;
		width: 94%;
		/* 修改为百分比，确保左右有3%的边距 */
		min-height: 68vh;
		margin: 0 auto;
		/* 水平居中 */
		background: #fff;
		border-radius: 48rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		z-index: 2;
		padding: 24rpx;
		padding-top: 90rpx;
		display: flex;
		flex-direction: column;
	}

	.avatar-wrap {
		position: absolute;
		left: 24rpx;
		top: -45rpx;
		z-index: 3;
		width: 90rpx;
		height: 90rpx;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* 两端对齐 */
		margin-bottom: 16rpx;

		.user-info {
			display: flex;
			flex-direction: column;
			margin-left: 110rpx;

			/* 让昵称整体右移，避免和头像重叠 */
			.nickname {
				font-size: 45rpx;
				font-weight: 500;
				font-style: 宋体;
				color: #4f4d4d;
				margin-bottom: 4rpx;
				margin-left: 100rpx;
				/* 添加此属性，控制向右移动的距离，数值可按需调整 */
				margin-top: -90rpx;
				text-align: left;
				position: relative;
				left: auto;
				/* 取消原来的绝对定位相关设置 */
				transform: translateX(0);
				width: auto;
			}
		}

		.menu-btn {
			width: 80rpx;
			height: 60rpx;
			position: relative;
			/* 启用相对定位 */
			top: -60rpx;
			left: -10rpx;


		}
	}

	/* 个人简介样式 */
	.user-desc {
		font-size: 24rpx;
		color: #999;
		margin-left: 80rpx;
		/* 与头像保持一定距离 */
	}

	/* 标签页样式 */
	.user-tabs {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background: #fff;
		font-size: 28rpx;
		margin-top: 24rpx;
		border-bottom: 1px solid #f0f0f0;

		.tab {
			color: #999;
			padding: 16rpx 0;
			position: relative;

			&.active {
				color: #333;
				font-weight: 600;
			}

			.red-dot {
				position: absolute;
				top: 8rpx;
				right: -20rpx;
				background: #ff4757;
				color: white;
				font-size: 20rpx;
				padding: 2rpx 6rpx;
				border-radius: 10rpx;
				min-width: 16rpx;
				height: 20rpx;
				line-height: 20rpx;
				text-align: center;
				transform: scale(0.8);
			}
		}
	}

	.tab-underline {
		display: flex;
		justify-content: space-around;
		background: #fff;

		.underline {
			width: 40rpx;
			height: 4rpx;
			border-radius: 2rpx;
			background: transparent;
			transition: background 0.2s;

			&.active {
				background: #333;
			}
		}
	}

	/* 文章列表样式 */
	.like-list {
		margin-top: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-top: 4rpx solid #e0e0e0;

		.like-card {

			display: flex;
			align-items: center;
			background: #fff;
			border-radius: 16rpx;
			box-shadow: none;
			margin-bottom: 40rpx;
			padding: 5rpx 8rpx 25rpx 0;
			width: 90%;
			justify-content: flex-start;
			position: relative;
			flex-direction: row;
			border-bottom: 4rpx solid #e0e0e0; // 明显的灰色横线

			.like-img {
				width: 130rpx;
				height: 150rpx;
				border-radius: 8rpx;
				object-fit: cover;
				margin-right: 40rpx;
				flex-shrink: 0;
			}

			.like-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
				text-align: left;
			}

			.like-title {
				font-size: 40rpx;
				font-weight: 600;
				margin-bottom: 32rpx; // 标题和正文间大空隙
				color: #4d4d4d;
				font-family: SimSun, 宋体, serif;
			}

			.like-desc {
				color: #666;
				font-size: 32rpx;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				width: 100%;
				max-width: 14em;
			}
		}
	}

	/* 消息列表样式 */
	.message-list {
		margin-top: 12rpx;
		padding: 0 12rpx;

		.empty-message {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 100rpx 0;

			.empty-icon {
				width: 120rpx;
				height: 120rpx;
				opacity: 0.3;
				margin-bottom: 20rpx;
			}

			.empty-text {
				color: #999;
				font-size: 28rpx;
			}
		}

		.message-item {
			display: flex;
			align-items: flex-start;
			padding: 24rpx 16rpx;
			background: #fff;
			border-radius: 12rpx;
			margin-bottom: 16rpx;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
			position: relative;
			transition: all 0.2s;

			&:active {
				background: #f8f8f8;
				transform: scale(0.98);
			}

			.message-avatar {
				margin-right: 20rpx;
				flex-shrink: 0;
			}

			.message-content {
				flex: 1;
				min-width: 0;

				.message-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 8rpx;

					.message-user {
						font-size: 28rpx;
						font-weight: 500;
						color: #333;
					}

					.message-time {
						font-size: 24rpx;
						color: #999;
					}
				}

				.message-text {
					font-size: 26rpx;
					color: #666;
					line-height: 1.4;
					word-break: break-all;
				}
			}

			.unread-indicator {
				position: absolute;
				top: 24rpx;
				right: 16rpx;
				width: 12rpx;
				height: 12rpx;
				background: #ff4757;
				border-radius: 50%;
			}
		}
	}

	.avatar-shadow {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.9);
		border-radius: 50%;
	}
</style>