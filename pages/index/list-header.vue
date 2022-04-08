<template>
	<view class="container">
		<view class="time">
			<picker mode="date" fields="month" :value="time" :end="timeEnd" @change="changeTime">
				<view>{{ timeStr }}</view>
			</picker>
		</view>
		<loading v-if="loading" type="circle" width="50rpx" height="50rpx"></loading>
		<view class="type">
			<uni-data-picker popup-title="请选择类型" :localdata="typeList" v-model="typeValue" @change="changeType"></uni-data-picker>
		</view>
	</view>
</template>

<script>
	import { getYMDTime, getTimestamp } from '/utils/date.js'
	import { expendType, incomeType, otherType } from '/config/type.js'

	import Loading from '/components/loading.vue'

	export default {
		components: {
			Loading
		},
		props: {
			loading: Boolean
		},
		data () {
			return {
				beginTime: 0,
				endTime: 0,
				time: '',
				timeStr: '',
				timeEnd: '',
				typeValue: '3-0', // 与 typeList 中的 value 值对应
				typeList: [{
					text: '全部类型',
					value: '3-0',
					children: [{text: '所有类型', value: '3-1'}]
				}, {
					text: '支出',
					value: '0-0',
					children: []
				}, {
					text: '收入',
					value: '1-0',
					children: []
				}, {
					text: '不计入收支',
					value: '2-0',
					children: []
				}]
			}
		},
		created () {
			// 初始化时间
			const { year, monthStr } = getYMDTime()
			const { beginTime, endTime } = getTimestamp()
			this.timeEnd = `${year}-${monthStr}`
			this._setTime(year, monthStr, beginTime, endTime)

			// 初始化类型
			expendType.forEach((expend, index) => {
				this.typeList[1].children.push({
					text: expend.type,
					value: `0-${index + 1}`
				})
			})
			incomeType.forEach((income, index) => {
				this.typeList[2].children.push({
					text: income.type,
					value: `1-${index + 1}`
				})
			})
			otherType.forEach((other, index) => {
				this.typeList[3].children.push({
					text: other.type,
					value: `2-${index + 1}`
				})
			})
		},
		methods: {
			changeTime (e) {
				const { value } = e.detail
				const { year, monthStr } = getYMDTime(new Date(value))
				const { beginTime, endTime } = getTimestamp(new Date(value))
				this._setTime(year, monthStr, beginTime, endTime)
			},
			_setTime (year, monthStr, beginTime, endTime) {
				this.time = `${year}-${monthStr}`
				this.timeStr = `${year}年${monthStr}月`
				this.beginTime = beginTime
				this.endTime = endTime
				this.$emit('time', {
					beginTime,
					endTime
				})
			},
			changeType (e) {
				const [ type, typeName ] = e.detail.value
				this.$emit('type', {
					type: type ? Number(type.value[0]) : 3, // type 取第一个字符转数字供外部使用
					typeName: typeName ? typeName.text : ''
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 0 10rpx 5rpx rgba(94, 73, 73, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
