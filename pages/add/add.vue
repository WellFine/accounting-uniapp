<template>
	<view class="header">
		<view class="type">
			<text :class="expendClass" @click="switchType(0)">支出</text>
			<text :class="incomeClass" @click="switchType(1)">收入</text>
			<text :class="otherClass" @click="switchType(2)">不计入收支</text>
		</view>
		<time-picker fields="day" :time="Number(handleTime)" @time="getTime"></time-picker>
	</view>
	<view class="money-input">
		<text class="symbol">￥</text>
		<input type="digit" v-model="money" @input="inputMoney" />
	</view>
	<view class="list">
		<type-list
			:type="type"
			:type-name="handleName" :subname="handleSubname"
			@getType="getTypeDetail"
		></type-list>
	</view>
	<view class="sub-list">
		<template v-for="(subname, index) in typeObj.subname" :key="subname">
			<view class="sub-item normal" :class="subIndex === index ? subClass : ''" @click="chooseSubname(index)">{{subname}}</view>
		</template>
	</view>
	<view class="account">
		<view
			class="wechat account-box" :style="{ 'box-shadow': account === 'wechat' ? '0 0 10rpx 10rpx rgba(82, 196, 26, 0.5)' : '' }"
			@click="chooseAccount('wechat')"
		>
			<image src="/static/account/wechat.png"></image>
			<text>微信</text>
		</view>
		<view
			class="alipay account-box" :style="{ 'box-shadow': account === 'alipay' ? '0 0 10rpx 10rpx rgba(24, 144, 255, 0.5)' : '' }"
			@click="chooseAccount('alipay')"
		>
			<image src="/static/account/alipay.png"></image>
			<text>支付宝</text>
		</view>
		<view
			class="bank account-box" :style="{ 'box-shadow': account === 'bank' ? '0 0 10rpx 10rpx rgba(245, 34, 45, 0.5)' : '' }"
			@click="chooseAccount('bank')"
		>
			<image src="/static/account/bank.png"></image>
			<text>银行卡</text>
		</view>
		<view
			class="cash account-box" :style="{ 'box-shadow': account === 'cash' ? '0 0 10rpx 10rpx rgba(19, 194, 194, 0.5)' : '' }"
			@click="chooseAccount('cash')"
		>
			<image src="/static/account/cash.png"></image>
			<text>现金</text>
		</view>
	</view>
	<view class="remark">
		<view v-if="!isAddRemark && !isUpdateOrDelete" class="remark-btn">
			<text :style="{ color: type === 0 ? '#40a9ff' : (type === 1 ? '#73d13d' : '#9254de') }" @click="readyAddRemark">添加备注</text>
			<button
				:class="typeClass" size="mini"
				:loading="isAdding" :disabled="isAdding"
				@click="add"
			>入账</button>
		</view>
		<textarea
			v-else v-model="remark"
			placeholder="请输入备注内容,最多50字" auto-height :maxlength="50"
			@input="inputRemark"
		></textarea>
	</view>
	<button
		v-if="isAddRemark" class="add-btn" :class="typeClass"
		:loading="isAdding" :disabled="isAdding"
		@click="add"
	>入账</button>
	<view v-if="isUpdateOrDelete" class="update-delete">
		<button type="primary" :loading="isUpdating" :disabled="isUpdating || isDeleting" @click="update">修改</button>
		<button type="warn" :loading="isDeleting" :disabled="isUpdating || isDeleting" @click="deleteFn">删除</button>
	</view>
</template>

<script>
	import { ref, computed, watch, nextTick } from 'vue'

	import { makeMoneyTrue, fixedMoney } from '/utils/money.js'
	import { expendType, incomeType, otherType } from '/config/type.js'

	import TimePicker from '/components/time-picker.vue'
	import TypeList from './type-list.vue'
	
	const incomeExpend = uniCloud.importObject('income-expend')

	export default {
		components: {
			TimePicker,
			TypeList
		},
		onLoad (options) { // setup 先执行，onLoad 后执行
			if (options.data) {
				this.handleData = JSON.parse(options.data)
				this.handleTime = options.time
			}
		},
		setup () {
			const type = ref(0)
			const expendClass = computed(() => type.value === 0 ? 'expend' : 'normal')
			const incomeClass = computed(() => type.value === 1 ? 'income' : 'normal')
			const otherClass = computed(() => type.value === 2 ? 'other' : 'normal')
			const typeClass = computed(() => type.value === 0 ? 'expend' : (type.value === 1 ? 'income' : 'other'))
			const switchType = value => {
				type.value = value
				nextTick(() => {
					typeObj.value = value === 0 ? expendType[0] : (value === 1 ? incomeType[0] : otherType[0])
					subIndex.value = 0
				})
			}

			const timeStr = ref('')
			const getTime = value => {
				timeStr.value = value
			}
			
			const money = ref('')
			const inputMoney = e => {
				// 使用 nextTick 等下一次 DOM 更新后再设置 money 值
				nextTick(() => {
					money.value = makeMoneyTrue(e.detail.value.trim())
				})
			}
			
			const typeObj = ref(expendType[0])
			const getTypeDetail = ({ type, index }) => {
				typeObj.value = type
				subIndex.value = index >= 0 ? index : 0
			}
			
			const subIndex = ref(0)
			const subClass = computed(() => type.value === 0 ? 'expend' : (type.value === 1 ? 'income' : 'other'))
			const chooseSubname = index => {
				subIndex.value = index
			}
			
			const account = ref('wechat')
			const chooseAccount = value => {
				account.value = value
			}
			
			const isAddRemark = ref(false)
			const remark = ref('')
			const readyAddRemark = () => {
				isAddRemark.value = true
			}
			const inputRemark = e => {
				remark.value = e.detail.value
			}
			
			const isAdding = ref(false)
			const add = () => {
				if (money.value < 0.01) {
					uni.showToast({
						icon: 'none',
						title: '金额不得小于 0.01'
					})
					return
				}
				
				isAdding.value = true

				incomeExpend.add(
					type.value, timeStr.value, money.value,
					typeObj.value.type, typeObj.value.py, typeObj.value.subname ? typeObj.value.subname[subIndex.value] : '',
					account.value, remark.value
				).then(res => {
					const { errCode, token, tokenExpired } = res
					
					if (errCode === 0) {
						// 经常执行入账操作，这里如果 token 快过期会获取到新 token，更新缓存中的 token
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
							title: '入账失败，请稍后重试'
						})
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.message
					})
				}).finally(() => {
					isAdding.value = false
				})
			}
			
			const handleData = ref(null)
			const handleTime = ref(0)
			const handleId = ref('')
			const handleName = ref('')
			const handleSubname = ref('')
			const isUpdateOrDelete = ref(false)
			let handleType = 0	// 原来的类型，用于事务操作中同步账户数据
			let handleMoney = 0 // 原来的金额，用于事务操作中同步账户数据
			let handleAccount = ''	// 原来的账户，用于事务操作中同步账户数据
			watch(handleData, value => {
				const { _id, type: typeVal, money: moneyVal, name, subname, account: accountVal, remark: remarkVal } = value
				isUpdateOrDelete.value = true
				handleId.value = _id
				type.value = typeVal
				handleType = typeVal
				money.value = fixedMoney(moneyVal)
				handleMoney = moneyVal
				handleName.value = name
				handleSubname.value = subname
				account.value = accountVal
				handleAccount = accountVal
				remark.value = remarkVal
			})

			const isUpdating = ref(false)
			const isDeleting = ref(false)
			const update = () => {
				if (money.value < 0.01) {
					uni.showToast({
						icon: 'none',
						title: '金额不得小于 0.01'
					})
					return
				}
				
				isUpdating.value = true
				
				incomeExpend.update(
					handleId.value, type.value, handleType, timeStr.value, money.value * 100, handleMoney,
					typeObj.value.type, typeObj.value.py, typeObj.value.subname ? typeObj.value.subname[subIndex.value] : '',
					account.value, handleAccount, remark.value
				).then(res => {
					const { errCode, errMsg } = res
					if (errCode === 0) {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					} else {
						uni.showToast({
							icon: 'none',
							title: errMsg
						})
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.message
					})
				}).finally(() => {
					isUpdating.value = false
				})
			}
			const deleteFn = () => {
				isDeleting.value = true
				
				incomeExpend.delete(handleId.value, handleType, handleMoney, handleAccount).then(res => {
					const { errCode, errMsg } = res
					if (errCode === 0) {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					} else {
						uni.showToast({
							icon: 'none',
							title: errMsg
						})
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: err.message || '出错了，请稍后重试'
					})
				}).finally(() => {
					isDeleting.value = false
				})
			}

			return {
				type,
				expendClass,
				incomeClass,
				otherClass,
				typeClass,
				switchType,
				getTime,
				money,
				inputMoney,
				typeObj,
				getTypeDetail,
				subIndex,
				subClass,
				chooseSubname,
				account,
				chooseAccount,
				isAddRemark,
				remark,
				readyAddRemark,
				inputRemark,
				isAdding,
				add,
				// 修改和删除内容
				isUpdateOrDelete,
				handleData,
				handleTime,
				handleName,
				handleSubname,
				isUpdating,
				update,
				isDeleting,
				deleteFn
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		box-sizing: border-box;
		padding: 10rpx 30rpx 20rpx;
	}
	
	.normal {
		color: var(--normal-color);
		background: var(--normal-background);
	}
	.expend {
		color: var(--expend-color);
		background: var(--expend-background);
	}
	.income {
		color: var(--income-color);
		background: var(--income-background);
	}
	.other {
		color: var(--other-color);
		background: var(--other-background);
	}

	.header {
		display: flex;
		justify-content: space-between;
		.type {			
			text {
				padding: 10rpx 20rpx;
				border-radius: 6rpx;
				font-size: 28rpx;
				
				&:nth-child(2) {
					margin: 0 20rpx;
				}
			}
		}
	}
	
	.money-input {
	  margin: 30rpx 0 20rpx;
	  padding-bottom: 10rpx;
	  border-bottom: 1px solid #f0f0f0;
	  font-weight: bold;
		display: flex;
		align-items: center;
		.symbol {
			font-size: 60rpx;
			margin-right: 10rpx;
		}
		input {
			flex: 1;
			height: 100%;
			font-size: 80rpx;
			letter-spacing: 2rpx;
		}
	}

	.sub-list {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
		
		.sub-item {
			margin: 0 20rpx 20rpx 0;
			padding: 10rpx 30rpx;
			border-radius: 6rpx;
		}
	}

	.account {
		margin: 18rpx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.account-box {
			padding: 10rpx 20rpx;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
		}
		
		image {
			width: 40rpx;
			height: 40rpx;
			margin-right: 14rpx;
		}
		
		text {
			font-size: 28rpx;
			color: #fff;
		}
		/* #ifdef MP-ALIPAY */
		/* 支付宝小程序中 text 内容会换行，这里强制不换行 */
		text {
			white-space: nowrap;
		}
		/* #endif */
		
		.wechat {
		  background: #52c41a;
		}
		.alipay {
		  background: #1890ff;
		}
		.bank {
		  background: #f5222d;
		}
		.cash {
		  background: #13c2c2;
		}
	}

	.remark {
		margin: 30rpx 0;

		.remark-btn {
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			text {
				font-size: 28rpx;
				margin-left: 20rpx;
				margin-right: 30rpx;
			}
			
			button {
				flex: 1;
				margin: 0;
				padding: 6rpx;
				font-size: 32rpx;
				font-weight: bold;
			}
		}
		
		textarea {
			width: 100%;
			padding: 10rpx 10rpx 20rpx;
			border-bottom: 1px solid #f0f0f0;
			font-size: 30rpx;
		}
	}

	.add-btn {
		font-size: 32rpx;
		font-weight: bold;
	}

	.update-delete {
		display: flex;
		justify-content: space-between;
		button {
			width: 45%;
			&:first-child {
				background: rgba(19, 194, 194, .3);
				color: rgb(19, 194, 194);
			}
		}
	}
</style>
