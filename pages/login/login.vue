<template>
	<view class="container">
		<!-- #ifdef MP-WEIXIN -->
		<view class="item wechat" @click="loginByWeixin">
			<image src="../../static/account/wechat.png"></image>
			<view class="text">微信登录</view>
		</view>
		<view class="link" @click="onClickLink">已有支付宝账户？点我同步</view>
		<!-- #endif -->
		<!-- #ifdef MP-ALIPAY -->
		<view class="item alipay" @click="loginByAlipay">
			<image src="../../static/account/alipay.png"></image>
			<view class="text">支付宝登录</view>
		</view>
		<view class="link" @click="onClickLink">已有微信账户？点我同步</view>
		<!-- #endif -->
	</view>
	<view v-if="isLogining" class="login-loading">
		<com-loading width="200rpx" height="100rpx"></com-loading>
	</view>
</template>

<script>
	import ComLoading from '/components/loading.vue'

	const login = uniCloud.importObject('login')

	export default {
		components: {
			ComLoading
		},
		data () {
			return {
				isLogining: false
			}
		},
		methods: {
			_loginErrorToast (title = '') {
				this.isLogining = false
				uni.showToast({
					icon: 'none',
					title: title || '登录失败，请稍后重试',
					duration: 2000
				})
			},
			loginByWeixin () {
				this.isLogining = true
				uni.login({
					provider: 'weixin',
					onlyAuthorize: true,
					success: async res => {
						const { code } = res
						try {							
							const { token, tokenExpired } = await login.loginByWeixin(code)
							if (token) {
								uni.setStorageSync('uni_id_token', token)
								uni.setStorageSync('uni_id_token_expired', tokenExpired)
								uni.showToast({
									icon: 'none',
									title: '登录成功',
									duration: 1000,
									success: () => {
										this.isLogining = false
										setTimeout(() => {
											uni.reLaunch({
												url: '/pages/index/index'
											})
										}, 1000)
									}
								})
							} else {
								this._loginErrorToast()
							}
						} catch (err) {
							this._loginErrorToast(`登录出错：${err.message}`)
						}
					},
					fail: () => {
						this._loginErrorToast()
					}
				})
			},
			loginByAlipay () {
				this.isLogining = true
				uni.login({
					provider: 'alipay',
					scopes: 'auth_base',
					success: async res => {
						const { code } = res
						const { token, tokenExpired } = await login.loginByAlipay(code)
						if (token) {
							uni.setStorageSync('uni_id_token', token)
							uni.setStorageSync('uni_id_token_expired', tokenExpired)
							uni.showToast({
								icon: 'none',
								title: '登录成功',
								duration: 1000,
								success: () => {
									this.isLogining = false
									setTimeout(() => {
										uni.reLaunch({
											url: '/pages/index/index'
										})
									}, 1000)
								}
							})
						} else {
							this._loginErrorToast()
						}
					},
					fail: () => {
						this._loginErrorToast()
					}
				})
			},
			onClickLink () {
				uni.showToast({
					icon: 'none',
					title: '同步账户功能开发中'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-loading {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.container {
		.item {
			width: 70%;
			padding: 20rpx;
			border-radius: 10rpx;
			margin: 100rpx 0 100rpx 50%;
			transform: translate(-50%);
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			
			&.wechat {
				background: #73d13d;
			}
			
			&.alipay {
				background: #40a9ff;
			}
			
			image {
				width: 80rpx;
				height: 80rpx;
			}
			
			.text {
				color: #fff;
				margin-left: 40rpx;
				font-size: 36rpx;
			}
		}
	
		.link {
			color: #40a9ff;
			text-align: center;
			text-decoration-line: underline;
			padding-bottom: 10rpx;
		}
	}
</style>
