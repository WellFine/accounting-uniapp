<template>
	<view class="container">
		<view class="money">
			<text>账户余额 (元)</text>
			<text>￥{{money}}</text>
		</view>
		<view class="add">
			<uni-icons type="plus-filled" size="50"></uni-icons>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			money: {
				type: String,
				default: '0.00'
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
		padding: 20rpx;
		
		.money {
			display: flex;
			flex-direction: column;

			text:first-child {
				font-size: 30rpx;
				margin-left: 10rpx;
			}
			
			text:last-child {
				font-size: 60rpx;
				font-weight: bold;
			}
		}
	}
</style>
