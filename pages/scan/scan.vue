<template>
	<view class="top">
		<view class="time">
			<time-picker fields="day" @time="getTime"></time-picker>
		</view>
		<view class="type-account">
			<uni-data-picker
				style="flex: 1; margin-right: 20rpx;"
				popup-title="选择类型" :localdata="typeList" v-model="typePickerValue" @change="changeType"
			></uni-data-picker>
			<uni-data-picker
				style="flex: 1;"
				popup-title="选择账户" :localdata="accountList" v-model="accountPickerValue"
			></uni-data-picker>
		</view>
		<input class="input-box" type="digit" placeholder="金额" v-model="money" @input="inputMoney" />
		<textarea class="input-box remark" maxlength="50" type="text" placeholder="备注" v-model="remark"></textarea>
		<view class="btn-container">
			<button type="warn" :disabled="isAdding" @click="goToIndexPage">返回首页</button>
			<button type="primary" :loading="isAdding" :disabled="isAdding" @click="add">入账</button>
		</view>
	</view>
	<view class="hint">拖拽下面的文字移动到输入框可以自动填充！</view>
	<view class="list">
		<template v-for="(item, index) in words" :key="index">
			<movable :style="movingIndex === index ? 'z-index: 101;' : ''" :text="item" @move="moving(index)" @moveEnd="moveEnd"></movable>
		</template>
	</view>
</template>

<script>
	import { ref, nextTick } from 'vue'
	import { expendType, incomeType, otherType } from '/config/type.js'
	import { makeMoneyTrue } from '/utils/money.js'
	import Movable from './movable.vue'
	import TimePicker from '/components/time-picker.vue'
	
	const incomeExpend = uniCloud.importObject('income-expend')

	export default {
		components: {
			Movable,
			TimePicker
		},
		setup () {
			let time = 0
			const getTime = timeVal => {
				time = timeVal
			}

			let type = 0
			let typeName = '餐饮'
			let py = 'canyin'
			let subname = '早餐'
			const typeList = ref([{
				text: '支出',
				value: '支出',
				children: []
			}, {
				text: '收入',
				value: '收入',
				children: []
			}, {
				text: '不计入收支',
				value: '不计入收支',
				children: []
			}])
			// 初始化类型
			expendType.forEach(expend => {
				typeList.value[0].children.push({
					text: expend.type,
					value: `支出-${expend.type}`,
					children: (expend.subname && expend.subname.map(subname => {
						return {
							text: subname,
							value: `支出-${expend.type}-${subname}`
						}
					})) || []
				})
			})
			incomeType.forEach(income => {
				typeList.value[1].children.push({
					text: income.type,
					value: `收入-${income.type}`,
					children: (income.subname && income.subname.map(subname => {
						return {
							text: subname,
							value: `收入-${income.type}-${subname}`
						}
					})) || []
				})
			})
			otherType.forEach(other => {
				typeList.value[2].children.push({
					text: other.type,
					value: `不计入收支-${other.type}`,
					children: (other.subname && other.subname.map(subname => {
						return {
							text: subname,
							value: `不计入收支-${other.type}-${subname}`
						}
					})) || []
				})
			})

			const typePickerValue = ref('支出-餐饮-早餐')
			const changeType = e => {
				const list = e.detail.value
				if (list.length === 0) {
					type = -1
					typeName = ''
					py = ''
					subname = ''
				} else {
					type = list[0].text === '支出' ? 0 : (list[0].text === '收入' ? 1 : 2)
					typeName = list[1].text
					py = (type === 0 ? expendType : (type === 1 ? incomeType : otherType)).find(item => item.type === typeName).py
					subname = list[2]?.text || ''
				}
			}

			const accountList = ref([{
				text: '微信',
				value: 'wechat'
			}, {
				text: '支付宝',
				value: 'alipay'
			}, {
				text: '银行卡',
				value: 'bank'
			}, {
				text: '现金',
				value: 'cash'
			}])
			const accountPickerValue = ref('wechat')

			const money = ref('')
			const inputMoney = e => {
				nextTick(() => {
					money.value = makeMoneyTrue(e.detail.value.trim())
				})
			}
			
			const remark = ref('')
			
			const goToIndexPage = () => {
				uni.switchTab({
					url: '/pages/index/index'
				})
			}
			
			const isAdding = ref(false)
			const add = () => {
				if (!money.value || money.value < 0.01) {
					uni.showToast({
						icon: 'none',
						title: '金额不得小于 0.01'
					})
					return
				} else if (type === -1 || typeName === '' || py === '') {
					uni.showToast({
						icon: 'none',
						title: '请选择类型'
					})
					return
				} else if (!accountPickerValue.value) {
					uni.showToast({
						icon: 'none',
						title: '请选择账户'
					})
					return
				}
				isAdding.value = true

				incomeExpend.add(type, time, money.value, typeName, py, subname, accountPickerValue.value, remark.value).then(res => {
					const { errCode, token, tokenExpired } = res
					
					if (errCode === 0) {
						// 经常执行入账操作，这里如果 token 快过期会获取到新 token，更新缓存中的 token
						if (token) {
							uni.setStorageSync('uni_id_token', token)
							uni.setStorageSync('uni_id_token_expired', tokenExpired)
						}
						uni.showToast({
							icon: 'none',
							title: '入账成功'
						})

						// 还原状态
						type = 0
						money.value = ''
						typeName = '餐饮'
						py = 'canyin'
						subname = '早餐'
						typePickerValue.value = '支出-餐饮-早餐'
						accountPickerValue.value = 'wechat'
						remark.value = ''

						// 删除用过的拖拽元素
						words.value = words.value.filter((item, index) => !indexList.includes(index))
						indexList = []
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

			const words = ref([])
			const list = []
			getApp().globalData.ocrData.forEach(item => list.push(item.words))
			words.value = list

			const movingIndex = ref(-1) // 拖拽时提升对应下标元素的 z-index，以便显示在输入框上面，同时方便入账后删除用过的元素
			let indexList = [] // 记录已经拖拽过的下标，入账后删除这些下标对应的数据
			const moving = index => {
				// 用下标确保拖拽时可以显示在输入框上面
				movingIndex.value = index
			}
			const moveEnd = ({ y, value }) => {
				if (y >= 80 && y <= 120) {
					// 拖拽到金额输入框
					money.value = makeMoneyTrue(value.replace(/[^\d\.]/g, ''))
					indexList.push(movingIndex.value)
				} else if (y >= 140 && y <= 215) {
					// 拖拽到备注输入框
					remark.value = value.slice(0, 50)
					indexList.push(movingIndex.value)
				}
				movingIndex.value = -1
			}
			
			return {
				getTime,
				typeList,
				typePickerValue,
				changeType,
				accountList,
				accountPickerValue,
				money,
				inputMoney,
				remark,
				goToIndexPage,
				isAdding,
				add,
				words,
				movingIndex,
				moving,
				moveEnd
			}
		}
	}
</script>

<style lang="scss" scoped>
	.top {
		position: sticky;
		top: 0;
		z-index: 100;
		background: #fff;
		.time {
			margin-bottom: 20rpx;
			display: flex;
		}
		.type-account {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
		}
		.input-box {
			box-sizing: border-box;
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			padding: 20rpx;
			margin-bottom: 20rpx;
			border-radius: 10rpx;
			border: 2rpx solid var(--normal-color);
		}
		.remark {
			height: 160rpx;
			line-height: 1;
		}
		.btn-container {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20rpx;
			button {
				flex: 1;
				&:first-child {
					margin-right: 20rpx;
				}
			}
		}
	}
	.hint {
		font-size: 24rpx;
		color: #ed6d46;
		text-align: center;
		margin-bottom: 20rpx;
	}
	.list {
		display: flex;
		flex-wrap: wrap;
	}
</style>
