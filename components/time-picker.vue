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
			const { year, monthStr, dayStr } = getYMDTime()
			
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
				this.dateEnd = date
				
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
