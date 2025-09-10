<template>
	<view class="login-container">
		<!-- Logo区域 -->
		<view class="logo-box">
			<view class="logo-circle">
				<text class="logo-text">栖</text>
				<text class="logo-text">心</text>
			</view>
		</view>

		<!-- 登录表单区域 -->
		<view class="login-form">

			<u-tabs :list="list1" @click="change" active-color="#000000">
			</u-tabs>

			<view v-if="current==0">


				<view class="input-item">
					<input v-model="phone" type="tel" placeholder="请输入您的手机号码" maxlength="11" class="custom-input"
						@input="onPhoneInput" />
				</view>

				<view class="input-item verify-box">
					<input v-model="pwd" type="tel" placeholder="输入您的密码" maxlength="6" class="custom-input"
						@input="onCodeInput" />
				</view>

			</view>
			<view v-if="current==1">
				<!-- 手机号输入框 -->
				<view class="input-item">
					<input v-model="phone" type="tel" placeholder="请输入您的手机号码" maxlength="11" class="custom-input"
						@input="onPhoneInput" />
				</view>

				<!-- 验证码输入框 -->
				<view class="input-item verify-box">
					<input v-model="code" type="tel" placeholder="验证码" maxlength="6" class="custom-input"
						@input="onCodeInput" />
					<button @click="getVerifyCode" :disabled="!!timer"
						class="verify-btn">{{timer ? `${countdown}s` : '获取验证码'}}</button>
				</view>

			</view>


			<!-- 登录按钮 -->
			<button @click="handleLogin" class="login-btn">立刻登录</button>
			<view class="login-tip">新用户将自动创建账号</view>

			<!-- 协议勾选 -->
			<view class="agreement-box">
				<radio :checked="agreed" @click="agreed=!agreed" class="custom-radio"></radio>
				<text class="agreement-text">
					我已阅读并同意
					<text class="link">《中国移动认证服务条款》》</text>、
					<text class="link">《用户协议》</text>和
					<text class="link">《隐私政策》</text>
				</text>
			</view>

		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				phone: '',
				code: '',
				pwd: '',
				agreed: false,
				timer: null,
				countdown: 60,
				current: 0,
				list1: [{
					name: '密码登录',
				}, {
					name: '验证码登录'
				}],
			}
		},
		methods: {
			change(item) {
				// 如果点击的是验证码登录（索引为1），显示敬请期待
				// if (item.index === 1) {
				// 	uni.showToast({
				// 		title: '敬请期待',
				// 		icon: 'none',
				// 		duration: 2000
				// 	})
				// 	// 不改变current值，保持在密码登录界面
				// 	return
				// }
				// 只有点击密码登录时才切换
				this.current = item.index;
			},
			// 添加输入过滤方法
			filterNumber(value) {
				return value.replace(/\D/g, '')
			},
			// 监听手机号输入
			onPhoneInput(e) {
				this.phone = this.filterNumber(e.detail.value)
			},
			// 监听验证码输入
			onCodeInput(e) {
				this.code = this.filterNumber(e.detail.value)
			},
			getVerifyCode() {
				if (!this.phone) {
					uni.showToast({
						title: '请输入手机号码',
						icon: 'none'
					})
					return
				}
				if (this.phone.length !== 11) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					})
					return
				}
				// 开始倒计时
				this.countdown = 60
				this.timer = setInterval(() => {
					if (this.countdown > 0) {
						this.countdown--
					} else {
						clearInterval(this.timer)
						this.timer = null
					}
				}, 1000)
						// TODO: 调用获取验证码接口
						uni.$u.get('/user/sendVerificationCode', {

							mobile: this.phone,
						}).then(res => {
						var tokenInfo = res.data;	

						}).catch(err => {

						})
			},

			handleLogin() {
				if (!this.phone) {
					uni.showToast({
						title: '请输入手机号码',
						icon: 'none'
					})
					return
				}

				if (!this.code && this.current == 1) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					})
					return
				}
				if (!this.agreed) {
					uni.showToast({
						title: '请阅读并同意相关协议',
						icon: 'none'
					})
					return
				}

				if (this.current == 0) {
					// TODO: 调用登录接口,验证码的时候
					uni.$u.post('/user/doLoginByPwd', {
						mobile: this.phone,
						password: this.pwd,
					}).then(res => {
						var tokenInfo = res.data;
						uni.setStorageSync('tokenName', tokenInfo.tokenName);
						uni.setStorageSync('tokenValue', tokenInfo.tokenValue);
						uni.setStorageSync('accountId', tokenInfo.accountId);
						// console.log("后端给的tokenName:"+tokenInfo.tokenName);
						// console.log("后端给的tokenValue:"+tokenInfo.tokenValue);
						uni.showToast({
							title: '登录成功'
						})
						//跳转到下个界面了
						uni.showLoading({
							title: '登录中...'
						})


						setTimeout(() => {
							uni.hideLoading()
							uni.reLaunch({
								url: '/pages/welcome/welcome'
							})
						}, 1500)
						//
					}).catch(err => {

					})
				}

				if (this.current == 1) {
					// TODO: 调用登录接口,验证码的时候
					uni.$u.post('/user/doLogin', {

						mobile: this.phone,
						verificationCode: this.code,
					}).then(res => {
						var tokenInfo = res.data;
						uni.setStorageSync('tokenName', tokenInfo.tokenName);
						uni.setStorageSync('tokenValue', tokenInfo.tokenValue);
						uni.setStorageSync('accountId', tokenInfo.accountId);
						// console.log("后端给的tokenName:"+tokenInfo.tokenName);
						// console.log("后端给的tokenValue:"+tokenInfo.tokenValue);
						uni.showToast({
							title: '登录成功'
						})
						//跳转到下个界面了
						uni.showLoading({
							title: '登录中...'
						})


						setTimeout(() => {
							uni.hideLoading()
							uni.reLaunch({
								url: '/pages/welcome/welcome'
							})
						}, 1500)
						//
					}).catch(err => {

					})
				}



			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-container {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding: 0;
		font-family: SimSun, "宋体", serif;
		position: relative;
		display: flex;
		flex-direction: column;

		.logo-box {
			flex: 0.4;
			display: flex;
			justify-content: center;
			align-items: center;
			padding-top: 40rpx;
			padding-bottom: 100rpx;
			background: #f8f8f8;
			position: relative;
			z-index: 1;

			.logo-circle {
				width: 320rpx;
				height: 320rpx;
				border-radius: 50%;
				border: 2rpx solid #000;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				background: #F7F7F7;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
				margin-bottom: 0;

				.logo-text {
					font-size: 76rpx;
					line-height: 1.4;
					font-weight: 500;
					font-family: SimSun, "宋体", serif;
				}
			}
		}

		.login-form {
			flex: 0.6;
			background-color: #fff;
			border-radius: 40rpx 40rpx 0 0;
			padding: 60rpx 40rpx;
			position: relative;
			z-index: 2;
			box-shadow: 0 -12rpx 40rpx rgba(0, 0, 0, 0.08);
			margin-top: -40rpx;
			display: flex;
			flex-direction: column;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background: rgba(0, 0, 0, 0.05);
			}

			.form-title-list {
				display: flex;
			}

			.form-title {
				font-size: 32rpx;
				font-weight: bold;
				margin-bottom: 60rpx;
				text-align: left;
				font-family: SimSun, "宋体", serif;
				color: #333;
				padding-left: 24rpx;
			}

			.input-item {
				background-color: #f5f5f5;
				border-radius: 8rpx;
				height: 88rpx;
				margin-bottom: 32rpx;
				padding: 0 24rpx;

				&.verify-box {
					display: flex;
					align-items: center;
					padding-right: 8rpx;
					gap: 12rpx;
				}

				.custom-input {
					flex: 1;
					height: 100%;
					font-size: 28rpx;
					color: #333;

					&::placeholder {
						color: #999;
						font-size: 28rpx;
					}
				}

				.verify-btn {
					height: 72rpx;
					padding: 0 24rpx;
					background: linear-gradient(to right, #666666, #333333);
					color: #fff;
					font-size: 28rpx;
					border-radius: 8rpx;
					border: none;
					min-width: 180rpx;

					&:active {
						opacity: 0.9;
					}

					&[disabled] {
						background: #ccc;
					}
				}
			}

			.login-btn {
				margin-top: 60rpx;
				width: 100%;
				height: 88rpx;
				line-height: 88rpx;
				background: linear-gradient(to right, #666666, #000000);
				color: #fff;
				font-size: 32rpx;
				border-radius: 44rpx;
				border: none;

				&:active {
					opacity: 0.9;
				}
			}

			.agreement-box {
				margin-top: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 40rpx;

				.agreement-text {
					font-size: 24rpx;
					color: #999;
					line-height: 1.4;
					font-weight: bold;

					.link {
						color: #666;
						font-weight: bold;
					}
				}
			}
		}
	}

	.agreement-box {
		display: flex;
		align-items: center;
		margin-top: 20px;
		padding: 0 20px;

		.agreement-text {
			font-size: 14px;
			color: #666666;

			.link {
				color: #000000;
				text-decoration: underline;
			}
		}
	}

	.login-tip {
		text-align: center;
		font-size: 24rpx;
		color: #999;
		margin-top: 16rpx;
	}
</style>