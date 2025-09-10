<template>
	<view class="page-container" @touchstart="onTouchStart" @touchend="onTouchEnd">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="back-icon">
				<u-icon name="arrow-left" color="#333" size="20" @click="toWelcome"></u-icon>
			</view>

			<view class="tabs">
				<text class="tab" :class="{ active: currentTab === 0 }" @tap="switchTab(0)">文章</text>
				<text class="tab" :class="{ active: currentTab === 1 }" @click="pleasewait">漂流瓶</text>
			</view>

			<image class="profile-icon" src="/static/img/mine.svg" mode="aspectFit" @tap="toProfile" />
		</view>

		<!-- 文章列表 -->
		<swiper ref="mySwiper" class="swiper-container" :current="currentArticleIndex" @change="onArticleSwiperChange">
			<swiper-item v-for="(article, articleIndex) in tabList[currentTab].list" :key="articleIndex"
				class="swiper-item-full">
				<!-- 全屏显示文章 -->
				<scroll-view class="article-scroll-full" scroll-y :enhanced="true" :show-scrollbar="false">
					<view class="article-container-full">
						<!-- 文章封面图 -->
						<view class="article-cover" v-if="article.img">
							<image :src="article.img" mode="widthFix"></image>
						</view>

						<!-- 文章头部 -->
						<view class="article-header">
							<text class="article-title">{{ article.title }}</text>
							<view class="article-meta">
								<text class="article-author">{{ article.author }}</text>
							</view>
						</view>

						<!-- 文章内容 -->
						<view class="article-content-full">
							<rich-text :nodes="article.content"></rich-text>
						</view>

						<!-- 文章底部数据 -->
						<view class="article-footer">
							<view class="action-item" @tap.stop="findCommentByPage(article.id)">
								<image src="/static/img/评论.svg" mode="aspectFit"></image>
								<text>{{ article.commentNumber || 0 }}</text>
							</view>
							<view class="action-item" @tap="updateArticleLike(article)">
								<image :src="article.isLike ? '/static/img/点赞-fill.svg' : '/static/img/点赞.svg'"
									:style="{ color: article.isLike ? '#fa3534' : '#666666' }" mode="aspectFit">
								</image>
								<text>{{ article.likeNumber || 0 }}</text>
							</view>
							<view class="action-item" @tap="pleasewait">
								<image src="/static/img/转发.svg" mode="aspectFit"></image>
							</view>
							<view class="action-item" @tap="pleasewait">
								<image src="/static/img/更多.svg" mode="aspectFit"></image>
							</view>
						</view>
					</view>

					<!-- 加载提示 -->
					<view class="loading" v-if="loading">
						<text>加载中...</text>
					</view>


				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 评论弹窗组件 -->
		<CommentSheet :show="showCommentSheet" :articleId="articleId" @close="showCommentSheet = false"
			:class="{ 'comment-sheet-fixed': true, 'comment-sheet-visible': showCommentSheet }" />


	</view>
</template>

<script>
	import CommentSheet from '@/components/CommentSheet.vue';

	export default {
		components: {
			CommentSheet
		},

		data() {
			return {
				currentTab: 0,
				currentArticleIndex: 0,
				loading: true,
				showCommentSheet: false,
				articleId: null,
				isLastArticle: false, // 添加标记是否在最后一篇文章
				articleLoading: false, // 控制动画显示
				// 文章列表数据结构
				tabList: [{
						id: 0,
						name: '文章',
						list: []
					},

				],

				newArticleList: [],
				isBatchLoaded: {}, // 用来记录每个批次加载状态
				// 滚动相关
				scrollTops: [0, 0], // 每个tab的滚动位置
				loadStatus: ['loadmore', 'loadmore'], // 加载状态
				// 触摸滑动
				touchStartX: 0,
				touchEndX: 0,
				minSwipeDistance: 50 // 将最小滑动距离50
			}
		},

		onLoad() {
			this.getArticleList();
		},

		//当 currentArticleIndex 发生变化，会自动执行函数。
		watch: {
			currentArticleIndex(newIndex) {
				const article = this.tabList[this.currentTab].list[newIndex];
				try {
					if (article && article.id) {
						this.readArticle(article.id);
					} else {
						console.log('没有找到有效的文章或文章id为空');
					}
				} catch (error) {
					console.error('在watch中发生错误：', error);
				}
			}
		},

		methods: {
			// switchTab(index) {
			// 	this.currentTab = index;
			// 	this.currentArticleIndex = 0;
			// },


			// onSwiperChange(e) {
			// 	this.currentTab = e.detail.current;
			// },


			//反动文章
			onArticleSwiperChange(e) {
				this.currentArticleIndex = e.detail.current;
				let totalNum = this.tabList[this.currentTab].list.length;

				console.log('当前文章索引:', e.detail.current + 1, '文章总数:', totalNum);
				//console.log('当前id', this.tabList[this.currentTab].list[this.currentArticleIndex].id);
				//console.log('currentArticleIndex', this.currentArticleIndex);
				//console.log(' e.detail.current', e.detail.current);
				//console.log('isNewListLoaded', this.isNewListLoaded);
				//console.log('list[name]', this.tabList[this.currentTab].list[this.currentArticleIndex].title);
				//console.log('list[id]', this.tabList[this.currentTab].list[this.currentArticleIndex].id);
				//console.log('read发送的id', this.tabList[this.currentTab].list[this.currentArticleIndex].id);

				// //调用readArticle接口
				// this.readArticle(this.tabList[this.currentTab].list[this.currentArticleIndex - 1].id);

				// 当阅读到第5n篇文章时加载新文章
				// if (e.detail.current >= 4) {
				// 	const batchIndex = Math.floor((e.detail.current - 4) / 5);
				// 	if ((this.currentArticleIndex + 1) % 5 === 0) {
				// 		const currentId = this.tabList[this.currentTab].list[this.currentArticleIndex].id;
				// 		console.log('整数' + (this.currentArticleIndex + 1) + '篇文章');

				// 		if (!this.isBatchLoaded[batchIndex]) {
				// 			console.log('开始加载第', batchIndex, '批新文章');

				// 			uni.$u.get('/article/getArticleList', {}).then(res => {
				// 				if (res && res.data) {
				// 					this.newArticleList = res.data.articles;
				// 					console.log('发送新文章请求成功!');
				// 				}
				// 				// 追加新文章到已有列表
				// 				this.tabList[0].list = [...this.tabList[0].list, ...this.newArticleList];
				// 				console.log('追加新文章成功');
				// 				this.$set(this.isBatchLoaded, batchIndex, true);
				// 			}).catch(err => {
				// 				console.error('加载新文章失败', err);
				// 			});
				// 		}

				// 	} 
				// }


				// 检查是否滑动到最后一篇文章
				if (e.detail.current === this.tabList[this.currentTab].list.length - 1) {
					console.log('已到达最后一篇文章,等待向右滑动操作');
					// 记录当前是最后一篇文章，等待向右滑动操作
					this.isLastArticle = true;
				} else {
					this.isLastArticle = false;
				}
			},

			// 触摸开始
			onTouchStart(e) {
				if (this.currentArticleIndex == this.tabList[this.currentTab].list.length - 1) {
					this.touchStartX = e.touches[0].clientX;
				}

			},

			// 触摸结束
			onTouchEnd(e) {
				if (this.currentArticleIndex == this.tabList[this.currentTab].list.length - 1) {
					this.touchEndX = e.changedTouches[0].clientX;
					this.handleSwipe();
				}
			},

			// 处理滑动
			handleSwipe() {
				const deltaX = this.touchStartX - this.touchEndX;
				console.log('滑动距离:', deltaX, '最小滑动距离:', this.minSwipeDistance);

				// 减小判断条件，使滑动更容易触发
				if (Math.abs(deltaX) < this.minSwipeDistance) {
					return;
				}

				if (this.loading || this.tabList[this.currentTab].list.length === 0) {
					console.log("当前数组长度:", this.tabList[this.currentTab].list.length)
					return;
				}

				// 如果是最后一篇文章并且向右滑动
				// 向右滑动: touchEndX > touchStartX，即deltaX > 0
				if (this.isLastArticle && deltaX > 0) {
					console.log('在最后一篇文章向左滑动');
					console.log("最后一篇文章id", this.tabList[0].list[this.tabList[0].list.length - 1].id);

					let shijiIndex = this.currentArticleIndex + 1;
					const batchIndex = Math.floor((shijiIndex - 5) / 5);

					if (shijiIndex % 5 === 0) {
						if (!this.isBatchLoaded[batchIndex]) {

							uni.$u.get('/article/getArticleList', {
								articleId: this.tabList[0].list[this.tabList[0].list.length - 1].id,
							}).then(res => {
								console.log("最后一篇文章id", this.tabList[0].list[this.tabList[0].list.length -
										1]
									.articleId);
								if (res && res.data) {
									this.newArticleList = res.data.articles;
									console.log('发送新文章请求成功!');
								}
								// 追加新文章到已有列表
								this.tabList[0].list = [...this.tabList[0].list, ...this.newArticleList];
								console.log('追加新文章成功');
								this.$set(this.isBatchLoaded, batchIndex, true);
								this.isLastArticle = false;

								//清空滑动值
								this.touchStartX = 0;
								this.touchEndX = 0;

								//阅读新加载的第一篇文章
								//this.readArticle(this.tabList[this.currentTab].list[this.currentArticleIndex].id);
							}).catch(err => {
								console.error('加载新文章失败', err);
							});
						}

					}


					// // 更新 currentArticleIndex
					// this.currentArticleIndex += 1;


					// this.tabList[0].list=this.newArticleList;
					// console.log('文章跳转');

					//  setTimeout(() => {
					// // 如果你的 swiper 组件支持 slideTo 参数，第一个参数是目标索引，
					// // 第二个参数是动画时间（ms）
					// this.$refs.mySwiper.slideTo(0, 500);
					// // 同时更新 currentArticleIndex
					// this.currentArticleIndex = 0;
					// }, 100);



					// // 添加过渡动画效果
					// const pageContainer = document.querySelector('.page-container');
					// if (pageContainer) {
					// 	pageContainer.style.transition = 'opacity 0.5s ease-out';
					// 	pageContainer.style.opacity = '0';
					// }

					// // 延迟跳转，等待动画完成
					// setTimeout(() => {
					// 	uni.redirectTo({
					// 		url: '/pages/welcome/welcome'
					// 	});
					// }, 500);
					// return;
				}
			},

			// 前往profile页面
			toProfile() {
				uni.navigateTo({
					url: '/pages/profile/profile'
				})
			},

			// 返回welcome页面
			toWelcome() {
				uni.navigateTo({
					url: '/pages/welcome/welcome'
				});
			},

			// 获取文章列表
			getArticleList() {
				this.loading = true;

				uni.$u.get('/article/getArticleList', {}).then(res => {

					if (res.data && res.data.articles && res.data.articles.length > 0) {
						// 替换整个文章列表（初始加载）
						this.tabList[0].list = res.data.articles;

						//第一篇需要手动加载一下
						if (this.tabList[0].list.length > 0 && this.tabList[0].list.length < 6) {
							const firstArticle = this.tabList[0].list[0];
							if (firstArticle && firstArticle.id) {
								//this.readArticle(firstArticle.id);
								console.log('初始触发第一篇文章阅读统计');
							}
						}
					} else {
						uni.showToast({
							title: '暂无文章',
							icon: 'none'
						});
						throw new Error('没有可用的文章');
					}
				}).catch(err => {
					console.error('获取文章失败:', err);
				}).finally(() => {
					this.loading = false;
				});
			},

			// 处理点赞
			updateArticleLike(article) {

				uni.$u.post('/article/updateArticleLike', {
					isLike: article.isLike,
					articleId: article.id,
				}, ).then(res => {
					console.log('点赞接口返回:', res);
					const currentLikes = parseInt(article.likeNumber) || 0;

					if (res.data === true) {
						// 点赞成功
						article.likeNumber = (currentLikes + 1).toString();
						article.isLike = true;
					} else if (res.data === false) {
						// 取消点赞成功
						article.likeNumber = Math.max(0, currentLikes - 1).toString();
						article.isLike = false;
					}
				}).catch(err => {
					console.error('点赞失败:', err);
					uni.showToast({
						title: '点赞失败',
						icon: 'none'
					});
				});
			},

			readArticle(articleId) {
				//调用readArticle接口
				uni.$u.post('/article/readArticle', {
					articleId: articleId
				}).then(res => {
					console.log('readArticle阅读文章成功');
				}).catch(err => {
					console.error('readArticle阅读文章失败:', err);
				});
			},

			// 分页查询评论
			findCommentByPage(articleId) {
				// 防止重复点击
				if (this._commentClickTimer) {
					console.log('防止重复点击');
					clearTimeout(this._commentClickTimer);
				}

				console.log('点击评论按钮，传入的articleId:', articleId);

				if (!articleId) {
					console.error('文章ID为空:', articleId);
					uni.showToast({
						title: '文章ID不存在',
						icon: 'none'
					});
					return;
				}

				// 先关闭评论弹窗，确保重新打开时会触发 watch
				this.showCommentSheet = false;

				// 使用 nextTick 确保视图更新后再打开弹窗
				this.$nextTick(() => {
					// 添加延迟，避免快速连续触发
					setTimeout(() => {
						console.log('设置articleId并显示评论弹窗');
						this.articleId = articleId;
						this.showCommentSheet = true;
					}, 50);
				});

				// 设置防抖标记，500ms内不允许再次触发完整流程
				this._commentClickTimer = setTimeout(() => {
					this._commentClickTimer = null;
				}, 500);
			},



			// 敬请期待
			pleasewait() {
				uni.showToast({
					title: '敬请期待!',
					icon: 'none',
					duration: 2000
				});
			},



			// 滚动到底部加载更多
			// reachBottom(tabIndex) {
			// 	if (this.loadStatus[tabIndex] !== 'loadmore') return;

			// 	this.loadStatus[tabIndex] = 'loading';

			// 	// 模拟加载更多数据
			// 	setTimeout(() => {
			// 		// 实际项目中应调用接口加载更多数据
			// 		this.loadStatus[tabIndex] = 'nomore';
			// 	}, 1500);
			// },



			// 根据ID查找文章
			// findArticleById(articleId) {
			// 	return this.tabList[this.currentTab].list.find(item => item.id === articleId);
			// },


			// 加载更多文章（替换当前列表）
			// loadMoreArticles() {
			// 	if (this.loading) return;

			// 	this.loading = true;
			// 	console.log('正在加载新的文章列表...');

			// 	uni.$u.get('/article/getArticleList', {}).then(res => {
			// 		console.log('新文章列表数据:', res);

			// 		if (res.data && res.data.articles && res.data.articles.length > 0) {
			// 			// 替换当前文章列表
			// 			this.tabList[this.currentTab].list = res.data.articles;

			// 			// 重置到第一篇文章
			// 			this.currentArticleIndex = 0;

			// 			uni.showToast({
			// 				title: '加载新文章成功',
			// 				icon: 'success'
			// 			});
			// 		} else {
			// 			uni.showToast({
			// 				title: '暂无更多文章',
			// 				icon: 'none'
			// 			});
			// 		}
			// 	}).catch(err => {
			// 		console.error('加载新文章失败:', err);
			// 		uni.showToast({
			// 			title: '加载失败',
			// 			icon: 'none'
			// 		});
			// 	}).finally(() => {
			// 		this.loading = false;
			// 	});
			// },
		}
	}
</script>

<style lang="scss" scoped>
	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		overflow: hidden;
		opacity: 1;
		/* 默认不透明 */
		transition: opacity 0.3s ease;
		/* 添加过渡效果 */
	}

	.nav-bar {
		height: 120rpx;
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		box-sizing: border-box;
	}

	.swiper-container {
		flex: 1;
		width: 100%;
		height: calc(100vh - 120rpx);
		overflow: hidden;
		z-index: 1;
	}

	/* 全屏swiper-item样式 */
	.swiper-item-full {
		height: 100% !important;
		width: 100% !important;
		display: flex !important;
		flex-direction: column !important;
	}

	/* 全屏scroll-view样式 */
	.article-scroll-full {
		flex: 1 !important;
		height: 100% !important;
		width: 100% !important;
		/* 确保可以滚动 */
		overflow-y: scroll !important;
		/* 修复iOS上的滚动问题 */
		-webkit-overflow-scrolling: touch !important;
	}

	/* 全屏文章容器 */
	.article-container-full {
		min-height: 100%;
		padding: 30rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	/* 全屏文章内容样式 */
	.article-content-full {
		flex: 1;
		font-size: 30rpx;
		line-height: 1.8;
		color: #333;
		padding: 20rpx 0;
		word-wrap: break-word;
		word-break: break-all;
		white-space: normal;
		/* 移除以下限制高度的样式 */
		/* height: auto !important; */
		/* max-height: none !important; */
		overflow: visible !important;

		/* 确保rich-text组件能够完全显示 */
		::v-deep rich-text {
			/* 移除以下限制高度的样式 */
			/* height: auto !important; */
			/* max-height: none !important; */
			overflow: visible !important;
			display: block !important;
		}
	}

	.tabs {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 50rpx;
	}

	.tab {
		font-size: 40rpx;
		color: #888888;
		padding-bottom: 16rpx;
		font-family: 'SimSun', serif;

		&.active {
			color: #333333;
			font-weight: 600;
			border-bottom: 4rpx solid #333333;
		}
	}

	.profile-icon {
		width: 56rpx;
		height: 56rpx;
	}

	.article-header {
		margin-bottom: 30rpx;

		.article-title {
			font-size: 40rpx;
			font-weight: 600;
			color: #333;
			line-height: 1.4;
			margin-bottom: 20rpx;
			font-family: 'SimSun', serif;
		}

		.article-meta {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.article-author {
				font-size: 28rpx;
				color: #666;
			}
		}
	}

	.article-cover {
		margin: 20rpx 0;

		image {
			width: 100%;
			height: auto;
			border-radius: 12rpx;
			object-fit: cover;
		}
	}

	.article-footer {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 20rpx 30rpx;
		background: #fff;
		border-top: 1rpx solid #f0f0f0;
		margin-top: 30rpx;
		flex-shrink: 0;

		.action-item {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 10rpx;

			image {
				width: 40rpx;
				height: 40rpx;
			}

			text {
				font-size: 24rpx;
				color: #666;
			}
		}
	}

	.loading {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12rpx;
		z-index: 1000;

		text {
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 确保深层样式穿透 */
	::v-deep .swiper-container {
		height: 100% !important;
	}

	::v-deep swiper-item {
		height: 100% !important;
		display: flex !important;
		flex-direction: column !important;
	}

	::v-deep scroll-view {
		flex: 1 !important;
		height: 100% !important;
	}

	/* 提示框样式 */
	.tooltip {
		position: fixed;
		z-index: 9999;
		background-color: rgba(0, 0, 0, 0.7);
		color: #fff;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		transform: translateX(-50%);
		max-width: 80%;
		text-align: center;
		pointer-events: none;
		/* 确保提示框不会阻挡点击事件 */
		animation: fadeIn 0.3s;
	}

	/* 添加评论弹窗的固定样式 */
	.comment-sheet-fixed {
		position: fixed !important;
		z-index: 10000 !important;
		/* 比其他元素更高的z-index */
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		/* 默认不拦截点击事件 */
	}

	/* 当评论弹窗显示时才拦截点击事件 */
	.comment-sheet-visible {
		pointer-events: auto !important;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	/* 可以删除或保留这些样式，因为我们使用了更好的解决方案 */
	.break-overflow {
		position: absolute;
		z-index: 999;
		top: 0;
		left: 0;
	}

	.fixed-element {
		position: fixed;
		z-index: 999;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.popup-element {
		position: fixed;
		top: var(--popup-top, 50%);
		left: var(--popup-left, 50%);
		z-index: 999;
		transform: translate(-50%, -100%);
	}
</style>