<template>
	<view class="time">
		<uni-datetime-picker
			type="date" :value="date" :end="dateEnd"
			@change="changeTime"
		>{{dateStr}}</uni-datetime-picker>
	</view>
</template>

<script>
	import { getYMDTime } from '/utils/date.js'

	export default {
		name:"time-picker",
		props: {
			fields: {
				type: String,
				default: 'month'
			},
			time: {
				type: Number,
				default: 0
			}
		},
		data () {
			return {
				date: '',
				dateStr: '',
				dateEnd: ''
			}
		},
		created () {
			const now = getYMDTime()
			this.dateEnd = `${now.year}-${now.monthStr}-${now.dayStr}`
		},
		beforeMount () {
			// 如果传入了时间参数，则以时间参数为基准，否则以当前时间为基准
			// 在 beforeMount 执行是因为只有这时开始才能拿到 props 参数
			const { year, monthStr, dayStr } = getYMDTime(this.time ? new Date(this.time) : undefined)
			this._setTime(year, monthStr, dayStr)
		},
		methods: {
			changeTime (time) {
				const [ year, month, day ] = time.split('-')
				
				this._setTime(year, month, day, true)
			},
			_setTime (year, month, day, isShowYear = false) {
				let date = '', dateStr = ''
				
				if (this.fields === 'year') {
					date = `${year}`
					dateStr = `${year}年`
				} else if (this.fields === 'month') {
					date = `${year}-${month}`
					dateStr = `${year}年${month}月`
				} else if (this.fields === 'day') {
					date = `${year}-${month}-${day}`
					dateStr = `${month}月${day}日`
					
					if (isShowYear && Number(year) < getYMDTime().year) {
						dateStr = `${year}年${dateStr}`
					}
				}
				
				this.date = date
				this.dateStr = dateStr
				
				this.$emit('time', date)
			}
		}
	}
</script>

<style lang="scss">
	.time {
		font-size: 24rpx;
		background: var(--normal-background);
		padding: 10rpx 20rpx;
		border-radius: 6rpx;
	}
</style>
