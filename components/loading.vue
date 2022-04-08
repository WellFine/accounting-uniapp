<template>
	<view class="container" :style="{ width, height }">
		<view v-if="type === 'line'" class="line">
			<view :style="{ background: color }"></view>
			<view :style="{ background: color }"></view>
			<view :style="{ background: color }"></view>
			<view :style="{ background: color }"></view>
			<view :style="{ background: color }"></view>
		</view>
		<view v-if="type === 'circle'" class="circle" :style="{ borderColor: color, borderTopColor: circleBorderTopColor }"></view>
	</view>
</template>

<script>
	export default {
		name:"loading",
		props: {
			type: {
				type: String,
				default: 'line'
			},
			width: {
				type: String,
				default: '100rpx'
			},
			height: {
				type: String,
				default: '100rpx'
			},
			color: {
				type: String,
				default: '#40a9ff'
			},
			circleBorderTopColor: {
				type: String,
				default: '#fff'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.line {
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: space-between;
			align-items: center;
			view {
				width: 10%;
				animation: line 1s linear infinite;
				&:nth-child(1) {
					animation-delay: 0.2s;
				}
				&:nth-child(2) {
					animation-delay: 0.4s;
				}
				&:nth-child(3) {
					animation-delay: 0.6s;
				}
				&:nth-child(4) {
					animation-delay: 0.8s;
				}
				&:nth-child(5) {
					animation-delay: 1s;
				}
				@keyframes line {
					0%, 100% {
						opacity: 0.3;
						height: 50%;
					}
					50% {
						opacity: 1;
						height: 100%;
					}
				}
			}
		}
		.circle {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			border-width: 4rpx;
			border-style: solid;
			animation: circle 1s linear infinite;
			@keyframes circle {
				0% {
					transform: rotate(0deg);
				}
				50% {
					transform: rotate(270deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
		}
	}
</style>
