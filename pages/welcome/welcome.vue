<template>
	<view class="welcome-page">
		
	
		<!-- 状态栏 -->
		<view class="status-bar">
			<!-- 返回按钮
			<u-icon name="arrow-left" color="#000000" size="25" class="back-icon" @tap="goBack"></u-icon> -->
			<view class="status-icons" >
				
				<image src="/static/img/我的.png" mode="aspectFit" class="search-icon" @tap="toProfile"></image>
				<image src="/static/img/功能栏.png" mode="aspectFit" class="menu-icon" @click="pleasewait"></image>
				<image src="/static/img/放大镜.png" mode="aspectFit" class="search-icon" @click="pleasewait"></image>
			</view>
		</view>
		
		<!-- 整个内容容器 -->
		<view class="content-container">
			<!-- 上半部分 - 浮动背景图 -->
			<view class="top-section">
				<swiper
					class="swiper"
					:current="currentIndex"
					@change="handleChange"
					:circular="true"
				>
					<swiper-item 
						v-for="(item, index) in scrollList" 
						:key="index"
						class="swiper-item"
					>
						<image :src="item.image" mode="aspectFill" class="background-image"></image>
					</swiper-item>
				</swiper>
			</view>
			
			<!-- 指示器移到主背景图下方 -->
			<view class="indicator-section">
				<view class="custom-indicator">
					<view 
						class="indicator-dot" 
						v-for="(item, index) in scrollList" 
						:key="index"
						:class="{ active: currentIndex === index }"
						@click="switchTo(index)"
					></view>
				</view>
			</view>
			
			<!-- 底部内容区 -->
			<view class="bottom-section">
				<!-- 可爱装饰星星 -->
				<view class="decoration-stars">
					<view class="star star1">✨</view>
					<view class="star star2">⭐</view>
					<view class="star star3">✨</view>
				</view>

				<view class="bottom-row">
					<button class="read-btn" @click="startReading">
						<view class="btn-content">
							<view class="btn-sparkles">
								<view class="sparkle sparkle1">✨</view>
								<view class="sparkle sparkle2">⭐</view>
							</view>
							<text class="btn-text">阅读日记</text>
							<view class="btn-heart">💖</view>
							<view class="btn-shine"></view>
						</view>
					</button>
					<view class="user-icon" >
						<view class="icon-crown">👑</view>
						<image src="/static/img/sharpicons_Bear.svg" mode="aspectFit" class="bear-icon" @click="goToAiChat"></image>
						<view class="user-icon-glow"></view>
						<view class="icon-sparkle">✨</view>
					</view>
				</view>
				<view class="motto">
					<view class="motto-heart">💕</view>
					总之岁月漫长，然而值得等待
					<view class="motto-star">⭐</view>
				</view>
			</view>
		</view>
	</view>
</template>


<script>
export default {
	data() {
		return {
			currentIndex: 0,
			scrollList: [
				{
					image: '/static/img/主背景板.png'
				},
				{
					image: '/static/img/主背景板1.png'
				},
				{
					image: '/static/img/主背景板2.png'
				}
			]
		}
	},
	onLoad() {
		console.log('欢迎页面已加载');
	},
	methods: {
		goToAiChat(e){
			uni.navigateTo({
				url: '/pages/robot/robot'
			})
		},
		handleChange(e) {
			this.currentIndex = e.detail.current
		},
		switchTo(index) {
			this.currentIndex = index
		},
		startReading() {
			uni.navigateTo({
				url: '/pages/article/article',
				success: () => {
					console.log('跳转成功')
				},
				fail: (err) => {
					console.error('跳转失败:', err)
					uni.showToast({
						title: '跳转失败',
						icon: 'none'
					})
				}
			})
		},
		pleasewait() {
            uni.showToast({
                title: '敬请期待!',
                icon: 'none',
                duration: 2000
            });
        },

		//我的页面
		toProfile() {
			//跳转到个人页面  url: '/pages/profile/profile'
			uni.navigateTo({
				url: '/pages/profile/profile'
			})
		},
		
		// 返回上一页
		// 跳转到welcome页面
		goBack() {
			uni.navigateTo({
				url: '/pages/welcome/welcome'
			});
		},
	}
}
</script>

<style lang="scss" scoped>
	.bear-icon{
		width: 40px;
		height: 40px;
	}
.welcome-page {
	position: relative;
	width: 100%;
	height: 100vh;
	background: #ffffff;
	overflow: hidden;
	
	/* 状态栏 */
	.status-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 44px;
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		z-index: 20;
		
		.time {
			font-size: 16px;
			font-weight: 500;
			color: #000;
		}
		
		.status-icons {
			display: flex;
			gap: 16px;
			.menu-icon, .search-icon {
				width: 28px;
				height: 28px;
			}
		}
	}
	
	/* 整个内容容器 */
	.content-container {
		position: relative;
		width: 100%;
		height: 100%;
		
		/* 上半部分浮动背景 */
		.top-section {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 66%;
			z-index: 2;
			
			overflow: hidden;
			
			.swiper {
				width: 100%;
				height: 100%;
				
				.swiper-item {
					width: 100%;
					height: 100%;
					
					.background-image {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
				}
			}
		}
		
		/* 调整指示器位置，确保在正确的位置显示 */
		.indicator-section {
			position: absolute;
			top: 64%;
			left: 0;
			right: 0;
			height: 30px;
			z-index: 3;
			display: flex;
			justify-content: center;
			align-items: center;
			background: transparent;
			margin-top: 10px;
			
			.custom-indicator {
				display: flex;
				gap: 12px;
				padding: 8px 16px;
				
				.indicator-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background-color: rgba(0, 0, 0, 0.2);
					transition: all 0.3s ease;
					cursor: pointer;
					
					&.active {
						width: 24px;
						border-radius: 4px;
						background-color: rgba(0, 0, 0, 0.8);
					}
					
					&:hover {
						transform: scale(1.1);
					}
				}
			}
		}
		
		/* 底部内容区 */
		.bottom-section {
			position: absolute;
			left: 0;
			right: 0;
			top: 66%;
			bottom: 0;
			z-index: 1;
			padding: 20px;
			background: linear-gradient(135deg, #F5F5DC 0%, #FAF0E6 50%, #FFF8DC 100%);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			/* 移除上部阴影 */
			&::before {
				display: none; /* 隐藏阴影渐变 */
			}

			/* 可爱装饰星星 */
			.decoration-stars {
				position: absolute;
				top: 10px;
				left: 0;
				right: 0;
				display: flex;
				justify-content: space-around;
				pointer-events: none;

				.star {
					font-size: 24px;
					animation: twinkle 2s infinite ease-in-out;

					&.star1 {
						animation-delay: 0s;
						opacity: 0.7;
					}
					&.star2 {
						animation-delay: 0.7s;
						opacity: 0.8;
					}
					&.star3 {
						animation-delay: 1.4s;
						opacity: 0.6;
					}
				}
			}

			.bottom-row {
				width: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				gap: 24px;
				margin-bottom: 24px;
				padding-left: 100px;
			}


			.read-btn {
				width: 240px;
				height: 75px;
				background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
				border-radius: 40px;
				border: 3px solid #F4A460;
				padding: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 12px 30px rgba(139, 69, 19, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.3);
				transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
				position: relative;
				overflow: hidden;
				cursor: pointer;
				transform: scale(1);

				&:active {
					transform: translateY(4px) scale(0.95);
					box-shadow: 0 6px 15px rgba(139, 69, 19, 0.6), inset 0 1px 5px rgba(0, 0, 0, 0.2);
				}

				.btn-content {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					height: 100%;
					position: relative;
					overflow: hidden;
					flex-direction: column;
					gap: 5px;
				}

				.btn-sparkles {
					position: absolute;
					top: -5px;
					display: flex;
					gap: 60px;

					.sparkle {
						font-size: 16px;
						animation: bounce 2s infinite ease-in-out;

						&.sparkle1 {
							animation-delay: 0s;
						}
						&.sparkle2 {
							animation-delay: 0.5s;
						}
					}
				}

				.btn-text {
					color: #ffffff;
					font-size: 20px;
					font-family: "Comic Sans MS", "微软雅黑", cursive;
					font-weight: 700;
					letter-spacing: 2px;
					z-index: 2;
					text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5);
				}

				.btn-heart {
					font-size: 18px;
					position: absolute;
					bottom: -8px;
					right: -8px;
					animation: heartbeat 1.5s infinite ease-in-out;
				}

				.btn-shine {
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
					animation: shine 4s infinite;
				}
			}

			.user-icon {
				position: relative;
				width: 60px;
				height: 60px;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #BC8F8F 100%);
				border-radius: 50%;
				border: 3px solid #F4A460;
				box-shadow: 0 8px 25px rgba(190, 143, 143, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.4);
				transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
				cursor: pointer;
				padding-right: 35px;
				transform: scale(1);

				&:active {
					transform: scale(0.9) rotate(-5deg);
					box-shadow: 0 4px 15px rgba(190, 143, 143, 0.7), inset 0 1px 4px rgba(0, 0, 0, 0.2);
				}

				.icon-crown {
					position: absolute;
					top: -8px;
					left: 50%;
					transform: translateX(-50%);
					font-size: 16px;
					animation: crownBounce 2s infinite ease-in-out;
					z-index: 3;
				}

				.user-img {
					width: 12rpx;
					height: 12rpx;
					opacity: 0.9;
					transition: all 0.4s ease;
					filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
				}

				.icon-sparkle {
					position: absolute;
					bottom: -5px;
					right: -5px;
					font-size: 14px;
					animation: sparkleTwinkle 1.8s infinite ease-in-out;
					z-index: 3;
				}

				.user-icon-glow {
					position: absolute;
					top: -3px;
					left: -3px;
					right: -3px;
					bottom: -3px;
					border-radius: 50%;
					background: linear-gradient(135deg, #DEB887, #D2B48C, #F4A460);
					opacity: 0;
					transition: opacity 0.4s ease;
					z-index: -1;
				}

				&:hover .user-icon-glow {
					opacity: 0.7;
				}

			}

			.motto {
				font-size: 18px;
				color: #654321;
				text-align: center;
				font-weight: 600;
				letter-spacing: 1px;
				text-shadow: 0 2px 4px rgba(101, 67, 33, 0.2);
				font-family: "Comic Sans MS", "微软雅黑", cursive;
				animation: fadeInUp 1s ease-out;
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8px;

				.motto-heart, .motto-star {
					font-size: 16px;
					animation: float 3s infinite ease-in-out;
				}

				.motto-heart {
					animation-delay: 0s;
				}

				.motto-star {
					animation-delay: 1s;
				}
			}
		}
	}
}

/* 返回按钮样式 */
.back-icon {
	padding: 15rpx;
	border-radius: 50%;
	transition: all 0.3s ease;
	cursor: pointer;
	margin-right: auto;
	background-color: transparent; /* 添加透明背景 */
}

/* 动画定义 */
@keyframes shine {
	0% {
		left: -100%;
	}
	50% {
		left: 100%;
	}
	100% {
		left: 100%;
	}
}

@keyframes fadeInUp {
	0% {
		opacity: 0;
		transform: translateY(20px);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes twinkle {
	0%, 100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 1;
		transform: scale(1.2);
	}
}

@keyframes bounce {
	0%, 20%, 50%, 80%, 100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-10px);
	}
	60% {
		transform: translateY(-5px);
	}
}

@keyframes heartbeat {
	0%, 100% {
		transform: scale(1);
	}
	25% {
		transform: scale(1.2);
	}
	50% {
		transform: scale(1.1);
	}
	75% {
		transform: scale(1.3);
	}
}

@keyframes crownBounce {
	0%, 20%, 50%, 80%, 100% {
		transform: translateX(-50%) translateY(0) rotate(0deg);
	}
	40% {
		transform: translateX(-50%) translateY(-8px) rotate(5deg);
	}
	60% {
		transform: translateX(-50%) translateY(-4px) rotate(-3deg);
	}
}

@keyframes sparkleTwinkle {
	0%, 100% {
		opacity: 0.5;
		transform: scale(1) rotate(0deg);
	}
	25% {
		opacity: 1;
		transform: scale(1.2) rotate(90deg);
	}
	50% {
		opacity: 0.7;
		transform: scale(0.9) rotate(180deg);
	}
	75% {
		opacity: 1;
		transform: scale(1.1) rotate(270deg);
	}
}

@keyframes float {
	0%, 100% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-8px);
	}
}



/* 悬停效果优化 */
@media (hover: hover) {
	.read-btn:hover {
		transform: translateY(-5px) scale(1.02);
		box-shadow: 0 15px 35px rgba(139, 69, 19, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.4);
	}

	.user-icon:hover {
		transform: scale(1.08) rotate(3deg);
		box-shadow: 0 10px 30px rgba(190, 143, 143, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.5);
	}

	.user-icon:hover .user-icon-glow {
		opacity: 0.8;
	}
}


</style>
