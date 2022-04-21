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
				<uni-icons type="plus" size="24"></uni-icons>
				<text>添加</text>
			</view>
			<view class="line"></view>
			<view class="scan" @click="scan">
				<uni-icons type="scan" size="24"></uni-icons>
				<text>ocr</text>
			</view>
			<view class="line"></view>
			<view class="search" @click="search">
				<uni-icons type="search" size="24"></uni-icons>
				<text>搜索</text>
			</view>
		</view>
	</view>
	<!-- #ifdef MP-ALIPAY -->
	<!-- <canvas style="position: absolute; top: -2000px; opacity: 0;" :style="`width: ${canvasWidth}px; height: ${canvasHeight}px;`" id="canvas"></canvas> -->
	<!-- #endif -->
</template>

<script>
	import Loading from '/components/loading.vue'
	import { fixedMoney } from '/utils/money.js'

	const scanObj = uniCloud.importObject('scan')

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
		// #ifdef MP-ALIPAY
		// data () {
		// 	return {
		// 		canvasWidth: 100,
		// 		canvasHeight: 100
		// 	}
		// },
		// #endif
		methods: {
			add () {
				this._navigate('/pages/add/add')
			},
			scan () {
				// #ifdef MP-ALIPAY
				// 支付宝小程序 ocr 扫描结果一直为空，所以暂时不支持
				uni.showToast({
					icon: 'none',
					title: '支付宝小程序暂不支持 ocr 扫描'
				})
				return
				// #endif

				uni.chooseImage({
					count: 1,
					success: async res => {
						uni.showLoading({
							title: '图片识别中',
							mask: true
						})

						// #ifdef MP-WEIXIN
						// 微信端直接获取图片 base64 用于 ocr
						const base64Img = uni.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64')
						// #endif

						// #ifdef MP-ALIPAY
						// 支付宝端需要用 canvas 获取图片 base64
						// const ctx = my.createCanvasContext('canvas')
						// const { width, height } = await my.getImageInfo({
						// 	src: res.tempFilePaths[0]
						// })
						// this.canvasWidth = width
						// this.canvasHeight = height
						// ctx.drawImage(res.tempFilePaths[0], 0, 0, width, height)
						// let base64Img = await ctx.toDataURL({
						// 	width,
						// 	height
						// })
						// base64Img = base64Img.replace('data:image/png;base64,', '')
						// #endif

						try {
							const scanRes = await scanObj.imageOcr(base64Img)
							uni.hideLoading()
							uni.showToast({
								icon: 'none',
								title: '识别成功',
								duration: 1500,
								success: () => {
									// ocr 识别出来的数据可能很大，url 长度有限制，所以在这里传输数据
									getApp().globalData.ocrData = scanRes.words_result
									setTimeout(() => {
										uni.redirectTo({
											url: '/pages/scan/scan'
										})
									}, 1500)
								}
							})
						} catch (err) {
							uni.hideLoading()
							uni.showToast({
								icon: 'none',
								title: err.errMsg
							})
						}
					}
				})
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
			.scan,
			.search {
				display: flex;
				align-items: center;
				vertical-align: middle;
			}
			.line {
				width: 2rpx;
				height: 40rpx;
				background-color: #e8c600;
			}
		}
	}
</style>
