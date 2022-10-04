<template>
	<view class="container">
		<view class="message">{{message}}</view>
	</view>
</template>

<script>
	export default {
		props: {
			code: String
		},
		computed: {
			message () {
				if (this.code === 'TOKEN_INVALID_ANONYMOUS_USER' || this.code === 'TOKEN_INVALID_WRONG_TOKEN') {
					return '用户未登录，登录以体验完整功能'
				} else if (this.code === 'TOKEN_INVALID_TOKEN_EXPIRED') {
					return '登录已过期，请重新登录'
				} else {
					return '出错了，请稍后重试'
				}
			}
		}
	}
</script>

<style scoped>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20rpx;
	}
	.message {
		color: #ed6d46;
		text-align: center;
		margin-bottom: 20rpx;
	}
	button {
		width: 100%;
	}
</style>