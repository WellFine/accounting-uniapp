<template>
	<view class="container">
		<view class="message">{{message}}</view>
		<button v-if="isLogin" type="warn" @click="goToLoginPage">去登录</button>
	</view>
</template>

<script>
	export default {
		props: {
			code: String
		},
		data () {
			return {
				isLogin: false
			}
		},
		computed: {
			message () {
				if (this.code === 'TOKEN_INVALID_ANONYMOUS_USER') {
					this.isLogin = true
					return '用户未登录，登录以体验完整功能'
				} else {
					return '出错了，请稍后重试'
				}
			}
		},
		methods: {
			goToLoginPage () {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		}
	}
</script>

<style>
	.container {
		margin-bottom: 20rpx;
	}
	.message {
		color: #ed6d46;
		text-align: center;
		margin-bottom: 20rpx;
	}
</style>