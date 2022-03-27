<template>
	<view class="container" :style="{ background: color }">
		<image :src="'/static/type/' + type + '.png'"></image>
	</view>
</template>

<script>
	export default {
		name:"type-icon",
		props: {
			type: String,
			color: {
				type: String,
				value: '#69c0ff'
			}
		}
	}
</script>

<style lang="scss">
	.container {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;

		image {
			width: 40rpx;
			height: 40rpx;
		}
	}
</style>
