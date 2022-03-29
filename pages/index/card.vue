<template>
	<view class="container">
		<view class="money" @click="goToAccountPage">
			<view class="title">
				<text>账户余额 (元)</text>
				<loading v-if="loading" type="circle" color="#000" circleBorderTopColor="#fde65e" width="20rpx" height="20rpx"></loading>
			</view>
			<text class="number">￥{{money}}</text>
		</view>
		<view class="add" @click="add">
			<uni-icons type="plus-filled" size="50"></uni-icons>
		</view>
	</view>
</template>

<script>
	import Loading from '/components/loading.vue'
	import { fixedMoney } from '/utils/money.js'

	export default {
		components: {
			Loading
		},
		props: {
			data: Object,
			loading: Boolean
		},
		computed: {
			money () {
				if (this.data) {					
					const { wechat, alipay, bank, cash } = this.data
					return fixedMoney(wechat + alipay + bank + cash)
				}
			}
		},
		methods: {
			add () {
				const { isLogin } = getApp().globalData

				if (isLogin) {
					uni.navigateTo({
						url: '/pages/add/add'
					})
				} else {
					uni.showToast({
						icon: 'none',
						title: '请先登录',
						duration: 1000,
						success: () => {
							setTimeout(() => {
								uni.navigateTo({
									url: '/pages/login/login'
								})
							}, 1000)
						}
					})
				}
			},
			goToAccountPage () {
				uni.navigateTo({
					url: '/pages/account/account'
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fde65e;
		color: #3c3044;
		border-radius: 20rpx;
		padding: 30rpx 20rpx;
		
		.money {
			display: flex;
			flex-direction: column;
			.title {
				display: flex;
				align-items: center;
				text:first-child {
					font-size: 30rpx;
					margin: 0 10rpx;
				}
			}
			.number {
				font-size: 60rpx;
				font-weight: bold;
			}
		}
	}
</style>
