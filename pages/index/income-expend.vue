<template>
	<view class="container">
		<view class="title">本月收入与支出对比图</view>
		<qiun-data-charts
			type="bar" :canvas2d="true" canvasId="index-bar-canvas-id"
			:chartData="chartData" :opts="options"
		/>
	</view>
</template>

<script>
	import { fixedMoney } from '/utils/money.js'

	export default {
		props: {
			income: Number,
			expend: Number
		},
		data () {
			return {
				options: {
					padding: [10, 50, 0, 5],
					xAxis: {
						// 关闭 x 轴
						disabled: true,
						// 关闭 x 轴刻度线
					  disableGrid: true
					},
					legend: {
						// 关闭下方图例显示
						show: false
					},
					extra: {
						bar: {
							// 柱子渐变色
							linearType: 'custom',
						}
					}
				}
			}
		},
		computed: {
			chartData () {
				return {
					categories: ['收入', '支出'],
					series: [{
						name: '金额',
						data: [Number(fixedMoney(this.income)), Number(fixedMoney(this.expend))]
					}]
				}
			}
		}
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		height: 300rpx;
		margin: 20rpx 0 60rpx 0;
		
		.title {
			text-align: center;
			color: #333;
		}
	}
</style>
