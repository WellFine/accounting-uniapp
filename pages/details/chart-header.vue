<template>
	<view class="container">
		<text class="title">{{ title }}</text>
		<view class="type">
			<text class="expend" :class="{ active: type === 0 }" @click="onChangeType(0)">支出</text>
			<text class="income" :class="{ active: type === 1 }" @click="onChangeType(1)">收入</text>
			<text class="other" :class="{ active: type === 2 }" @click="onChangeType(2)">不计入收支</text>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			title: String,
			isLoading: Boolean
		},
		data () {
			return {
				type: 0
			}
		},
		methods: {
			onChangeType (type) {
				// 正在加载时不允许切换类型
				if (this.isLoading) return
				this.type = type
				this.$emit('type', type)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 30rpx 0;
		.title {
			font-size: 32rpx;
		}
		.type {
			text {
				padding: 10rpx 20rpx;
				border-radius: 6rpx;
				color: var(--normal-color);
				background: var(--normal-background);
				&:nth-child(2) {
					margin: 0 20rpx;
				}
			}
			.income.active {
				color: var(--income-color);
				background: var(--income-background);
			}
			.expend.active {
				color: var(--expend-color);
				background: var(--expend-background);
			}
			.other.active {
				color: var(--other-color);
				background: var(--other-background);
			}
		}
	}
</style>