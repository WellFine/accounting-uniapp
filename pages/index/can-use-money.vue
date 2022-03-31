<template>
	<view class="container">
		<template v-if="!loading">
			<view class="money" @click="goToAccountPage">
				<view class="info">
					<text>本月可支配金额</text>
					<text>￥{{ fixedMoney(useMoney) }}</text>
				</view>
				<view class="info">
					<text v-if="leftoverMoney >= 0">本月剩余可支配金额</text>
					<text v-else>本月已超支</text>
					<text>￥{{ fixedMoney(leftoverMoney) }}</text>
				</view>
			</view>
			<view class="charts-box">
				<qiun-data-charts
					type="arcbar" :canvas2d="true" canvasId="index-arcbar-canvas-id"
					:chartData="chartData" :opts="options"
				/>
			</view>
		</template>
		<loading v-else type="circle"></loading>
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
			useMoney: {
				type: Number,
				default: 0
			},
			expendMoney: {
				type: Number,
				default: 0
			},
			loading: Boolean
		},
		computed: {
			leftoverMoney () {
				return this.useMoney - this.expendMoney
			},
			ratio () {
				const res = this.leftoverMoney / this.useMoney
				return res >= 0 ? res : 0
			},
			options () {
				return {
					title: {
						name: `${(this.ratio * 100).toFixed(2)}%`,
						fontSize: 32,
						color: this.getColor(this.ratio),
						// 上移中间字体
						offsetY: -8,
					},
					subtitle: {
						// 设置副标题为空
						name: '',
					}
				}
			},
			chartData () {
				return {
					series: [{
						data: this.ratio,
						color: this.getColor(this.ratio)
					}]
				}
			}
		},
		methods: {
			fixedMoney,
			goToAccountPage () {
				uni.navigateTo({
					url: '/pages/account/account'
				})
			},
			getColor (value) {
				return value < 0.3 ? '#f5222d' : (value < 0.6 ? '#ffc53d' : '#73d13d')
			}
		}
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		height: 300rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		margin-top: 40rpx;
		
		.money {
			.info {
				display: flex;
				flex-direction: column;
				
				text:first-child {
					font-size: 30rpx;
					color: #595959;
					margin-bottom: 6rpx;
				}
				
				text:last-child {
					font-size: 40rpx;
					font-weight: bold;
				}
			}
			.info:first-child {
				margin-bottom: 10rpx;
			}
		}
		
		.charts-box {
			width: 50%;
			height: 300rpx;
		}
	}
</style>
