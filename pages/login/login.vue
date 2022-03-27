<template>
	<view class="container">
		<!-- #ifdef MP-WEIXIN -->
		<view class="item wechat" @click="loginByWeixin">
			<image src="../../static/account/wechat.png"></image>
			<view class="text">微信登录</view>
		</view>
		<view class="link">已有支付宝账户？点我同步</view>
		<!-- #endif -->
		<!-- #ifdef MP-ALIPAY -->
		<view class="item alipay">
			<image src="../../static/account/alipay.png"></image>
			<view class="text">支付宝登录</view>
		</view>
		<view class="link">已有微信账户？点我同步</view>
		<!-- #endif -->
	</view>
</template>

<script>
	const login = uniCloud.importObject('login')

	export default {
		methods: {
			_loginErrorToast (title = '') {
				uni.showToast({
					icon: 'none',
					title: title || '登录失败，请稍后重试',
					duration: 2000
				})
			},
			loginByWeixin () {
				uni.login({
					provider: 'weixin',
					onlyAuthorize: true,
					success: async res => {
						const { code } = res
						const { token, tokenExpired } = await login.loginByWeixin(code)
						this._loginErrorToast()
						if (token) {
							uni.showToast({
								icon: 'none',
								title: '登录成功',
								duration: 1000,
								success: () => {
									setTimeout(() => {
										uni.switchTab({
											url: '/pages/index/index'
										})
									}, 1000)
								}
							})
							uni.setStorageSync('uni_id_token', token)
							uni.setStorageSync('uni_id_token_expired', tokenExpired)
						} else {
							this._loginErrorToast()
						}
					},
					fail: () => {
						this._loginErrorToast()
					}
				})
			}
		}
	}
</script>

<style lang="scss">
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
