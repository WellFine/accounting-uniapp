<template>
	<view class="container">
		<view class="header">
			<text class="time">{{ time }}</text>
			<view class="income-expend">
				<view class="income" v-if="totalIncome > 0">
					<text class="icon">+</text>
					<text class="money">￥{{ fixedMoney(totalIncome) }}</text>
				</view>
				<view class="expend" v-if="totalExpend > 0">
					<text class="icon">-</text>
					<text class="money">￥{{ fixedMoney(totalExpend) }}</text>
				</view>
			</view>
		</view>
		<view class="info-list">
			<template v-for="(item, index) in data.data" :key="index">
				<view class="info-item">
					<view class="left-info">
						<type-icon :type="item.py"></type-icon>
						<view class="details">
							<view class="name">{{ item.name + (item.subname ? ` - ${item.subname}` : '') }}</view>
							<view class="remark">{{ item.remark }}</view>
						</view>
					</view>
					<view class="money">{{ (item.type === 0 ? '-' : (item.type === 1 ? '+' : '')) + fixedMoney(item.money) }}</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script>
	import TypeIcon from '/components/type-icon.vue'
	
	import { getYMDTime } from '/utils/date.js'
	import { fixedMoney } from '/utils/money.js'

	export default {
		components: {
			TypeIcon
		},
		props: {
			data: {
				type: Object,
				required: true
			}
		},
		data () {
			return {
				time: 0,
				totalIncome: 0,
				totalExpend: 0
			}
		},
		created () {
			const { time, data: list } = this.data
			const { monthStr, dayStr } = getYMDTime(new Date(time))
			this.time = `${monthStr}月${dayStr}日`
			for (const item of list) {
				if (item.type === 0) this.totalExpend += item.money
				else if (item.type === 1) this.totalIncome += item.money
			}
		},
		methods: {
			fixedMoney
		}
	}
</script>

<style lang="scss">
	.container {
		box-shadow: 0 0 10rpx 5rpx rgba(94, 73, 73, 0.1);
		border-radius: 20rpx;
		margin-top: 30rpx;

		.header,
		.info-list {
			padding: 20rpx 30rpx;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: #f9f9f9;
			// border-top-left-radius: 20rpx;
			// border-top-right-radius: 20rpx;
			
			.income-expend {
				display: flex;
				.icon {
					font-size: 32rpx;
					font-weight: bold;
				}
				.money {
					font-size: 30rpx;
				}

				.income {
					.icon {
						color: #ff4d4f;
					}
				}
				.expend {
					margin-left: 20rpx;
					.icon {
						color: #73d13d;
					}
				}
			}
		}

		.info-list {
			.info-item {
				margin-top: 30rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				&:first-child {
					margin-top: 0;
				}
				.left-info {
					display: flex;
					align-items: center;
					.details {
						margin-left: 20rpx;
						.remark {
							max-width: 300rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							font-size: 26rpx;
							color: var(--normal-color);
						}
					}
				}
				.money {
					max-width: 150rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
	}
</style>
