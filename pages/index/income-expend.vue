<template>
	<view class="container">
		<view class="title">本月支出与收入对比图</view>
		<qiun-data-charts
			type="bar"
			:chartData="chartData"
			:opts="options"
			:canvas2d="true"
			background="none"
		/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				options: {
					xAxis: {
						// 关闭 x 轴
						disabled: true,
						// 关闭 x 轴刻度线
					  disableGrid: true,
					},
					yAxis: {
						// 关闭 y 轴
						disabled: true,
					},
					extra: {
						bar: {
							// 柱子间距离
							seriesGap: 5,
							// 结尾圆弧
							barBorderCircle: true,
							// 柱子渐变色
							linearType: 'custom',
						}
					}
				},
				chartData: {}
			}
		},
		onLoad () {
			setTimeout(() => {
				this.chartData = {
					categories: [''],
					series: [{
						name: '支出',
						data: [100]
					}, {
						name: '收入',
						data: [200]
					}]
				}
			}, 100)
		}
	}
</script>

<style lang="scss">
	.container {
		width: 100%;
		height: 300rpx;
		margin: 50rpx 0;
		
		.title {
			text-align: center;
			color: #333;
		}
	}
</style>
