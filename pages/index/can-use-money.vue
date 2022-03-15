<template>
	<view class="container">
		<view class="money">
			<view class="info">
				<text>本月可支配金额</text>
				<text>￥{{useMoney}}</text>
			</view>
			<view class="info">
				<text>本月可支配金额</text>
				<text>￥{{leftoverMoney}}</text>
			</view>
		</view>
		<view class="charts-box">
			<qiun-data-charts
			  type="arcbar"
			  :chartData="chartData"
				:opts="options"
			  background="none"
			/>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			useMoney: {
				type: String,
				default: '0.00'
			},
			leftoverMoney: {
				type: String,
				default: '0.00'
			}
		},
		data () {
			return {
				options: {},
				chartData: {}
			}
		},
		onLoad () {
			this.options = {
				title: {
					name: '数值',
					fontSize: 36,
					color: this.getColor(0.9),
					// 上移中间字体
					offsetY: -8,
				},
				subtitle: {
					// 设置副标题为空
					name: '',
				}
			}
			this.chartData = {
				series: [{
					data: 0.8,
					color: this.getColor(0.9)
				}]
			}
		},
		methods: {
			getColor (value) {
				return value < 0.3 ? '#f5222d' : (value < 0.6 ? '#ffc53d' : '#73d13d')
				// switch (type) {
				// 	case 'background':
				// 		return value < 0.3 ? '#fdc4c8' : (value < 0.6 ? '#fff1d0' : '#d3f1c2')
				// 	case 'wave':
				// 		return value < 0.3 ? '#f5222d' : (value < 0.6 ? '#ffc53d' : '#73d13d')
				// 	case 'text':
				// 		return value < 0.3 ? '#f5222d' : (value < 0.6 ? 'rgb(51,160,141)' : '#69c0ff')
				// }
			}
		}
	}
</script>

<style lang="scss">
	.container {
		display: flex;
		justify-content: space-around;
		align-items: center;
		
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
