<template>
	<text class="hint">注意：当余额不足以扣除支出金额时会置为 0！</text>
	<unicloud-db
		v-slot:default="{ data, loading, error }" collection="account"
		where="uid==$cloudEnv_uid" ref="account"
		@load="loadData"
	>
		<view v-if="error">{{error.message}}</view>
		<view v-else-if="loading" class="loading">
			<loading></loading>
		</view>
		<view v-else class="container">
			<view class="wechat box">
				<text>微信余额</text>
				<input type="digit" v-model="wechat" data-account="wechat" @input="onInput" />
			</view>
			<view class="alipay box">
				<text>支付宝余额</text>
				<input type="digit" v-model="alipay" data-account="alipay" @input="onInput" />
			</view>
			<view class="bank box">
				<text>银行卡余额</text>
				<input type="digit" v-model="bank" data-account="bank" @input="onInput" />
			</view>
			<view class="cash box">
				<text>现金余额</text>
				<input type="digit" v-model="cash" data-account="cash" @input="onInput" />
			</view>
			<view class="can-use-money box">
				<text>月开销额度</text>
				<input type="digit" v-model="canUseMoney" data-account="canUseMoney" @input="onInput" />
			</view>
			<button class="btn" :loading="isRequest" :disabled="isRequest" @click="clickBtn">确定</button>
		</view>
	</unicloud-db>
</template>

<script>
	import Loading from '/components/loading.vue'
	import { makeMoneyTrue, fixedMoney } from '/utils/money.js'
	
	const account = uniCloud.importObject('account')

	export default {
		components: {
			Loading
		},
		data () {
			return {
				wechat: '0',
				alipay: '0',
				bank: '0',
				cash: '0',
				canUseMoney: '0',
				method: 'add',
				isRequest: false
			};
		},
		methods: {
			loadData (data) {
				if (data.length > 0) {
					const { wechat, alipay, bank, cash, canUseMoney } = data[0]
					this.method = 'update'
					this.wechat = fixedMoney(wechat)
					this.alipay = fixedMoney(alipay)
					this.bank = fixedMoney(bank)
					this.cash = fixedMoney(cash)
					this.canUseMoney = fixedMoney(canUseMoney)
				}
			},
			onInput (e) {
				const { account } = e.currentTarget.dataset
				// nextTick 不起作用，改用 setTimeout 替代
				// this.$nextTick(() => {
				// 	this[`${account}`] = makeMoneyTrue(e.detail.value.trim())
				// })
				setTimeout(() => {
					this[`${account}`] = makeMoneyTrue(e.detail.value.trim())
				}, 0)
			},
			clickBtn () {
				this.isRequest = true

				account[`${this.method}`](this.wechat, this.alipay, this.bank, this.cash, this.canUseMoney).then(res => {
					const { errCode, errMsg, token, tokenExpired } = res
					
					if (errCode === 0) {
						if (token) {
							uni.setStorageSync('uni_id_token', token)
							uni.setStorageSync('uni_id_token_expired', tokenExpired)
						}
						uni.reLaunch({
							url: '/pages/index/index'
						})
					} else {
						uni.showToast({
							icon: 'none',
							title: errMsg
						})
					}
				}).catch(() => {
					uni.showToast({
						icon: 'none',
						title: '设置失败，请稍后重试'
					})
				}).finally(() => {
					this.isRequest = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.hint {
		color: #ed6d46;
		font-size: 24rpx;
	}
	.loading {
		width: 100%;
		height: 700rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.wechat {
		color: #52c41a;
		background: #d9f7be;
	}
	.alipay {
		color: #1890ff;
		background: #bae7ff;
	}
	.bank {
		color: #f5222d;
		background: #ffccc7;
	}
	.cash {
		color: #13c2c2;
		background: #b5f5ec;
	}
	.can-use-money {
		color: #722ed1;
		background: #efdbff;
	}
	.box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 40rpx;
		margin: 30rpx 0;
		border-radius: 10rpx;
		input {
			flex: 1;
			max-width: 65%;
			height: 100%;
			margin-left: 30rpx;
			font-size: 50rpx;
		}
	}
	.btn {
		width: 60%;
		color: #eb2f96;
		background: #ffd6e7;
		/* #ifdef MP-ALIPAY */
		margin-left: 50%;
		transform: translateX(-50%);
		/* #endif */
	}
</style>
