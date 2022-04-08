<template>
	<view class="container">
		<view class="money" @click="goToAccountPage">
			<view class="title">
				<text>账户余额 (元)</text>
				<loading v-if="loading" type="circle" color="#000" circleBorderTopColor="#fde65e" width="20rpx" height="20rpx"></loading>
			</view>
			<text class="number">￥{{money}}</text>
		</view>
		<view class="operate">
			<view class="add" @click="add">
				<uni-icons type="plus-filled" size="26"></uni-icons>
				<text>添加</text>
			</view>
			<view class="line"></view>
			<view class="search" @click="search">
				<uni-icons type="search" size="26"></uni-icons>
				<text>搜索</text>
			</view>
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
				} else return '0.00'
			}
		},
		methods: {
			add () {
				this._navigate('/pages/add/add')
			},
			search () {
				this._navigate('/pages/search/search')
			},
			goToAccountPage () {
				uni.navigateTo({
					url: '/pages/account/account'
				})
			},
			_navigate (url) {
				// #ifdef MP-WEIXIN
				const { isLogin } = getApp().globalData
				if (!isLogin) {
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
					return
				}
				// #endif

				uni.navigateTo({
					url
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		background: #fde65e;
		color: #3c3044;
		border-radius: 20rpx;
		padding: 30rpx 20rpx 18rpx;
		
		.money {
			display: flex;
			flex-direction: column;
			padding-bottom: 10rpx;
			border-bottom: 2rpx solid #e8c600;
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
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		
		.operate {
			display: flex;
			justify-content: space-evenly;
			align-items: center;
			margin-top: 10rpx;
			.add,
			.search {
				display: flex;
				align-items: center;
				vertical-align: middle;
			}
			.line {
				width: 4rpx;
				height: 40rpx;
				background-color: #e8c600;
			}
		}
	}
</style>
