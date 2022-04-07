<template>
	<picker class="time-picker" mode="date" fields="month" :value="date" :end="dateEnd" @change="onChangeDate">{{dateStr}}</picker>
	<unicloud-db
		v-slot:default="{ data, loading, error }" collection="income-expend"
		:where="`uid==$cloudEnv_uid&&time>=${beginTime}&&time<${endTime}`"
		groupby="type" group-field="sum(money) as money"
		@load="loadIncomeExpendData"
	>
		<view v-if="error">
			<udb-error :code="error.code"></udb-error>
		</view>
		<view v-else class="income-expend">
			<view class="expend flex-box">
				<text class="title">共支出</text>
				<text v-if="!loading" class="money">￥{{ totalExpend }}</text>
				<com-loading v-else type="circle" width="40rpx" height="40rpx" />
			</view>
			<view class="income flex-box">
				<text class="title">共收入</text>
				<text v-if="!loading" class="money">￥{{ totalIncome }}</text>
				<com-loading v-else type="circle" width="40rpx" height="40rpx" color="#73d13d" />
			</view>
		</view>
	</unicloud-db>
	<unicloud-db
		v-slot:default="{ data, loading, error }" collection="income-expend"
		:where="`uid==$cloudEnv_uid&&time>=${beginTime}&&time<${endTime}&&type==${nameType}`"
		groupby="name" group-field="sum(money) as money, push(subname, money) as dataList"
		@load="loadNameData"
	>
		<view v-if="error">{{error.message}}</view>
		<view v-else class="charts-container">
			<chart-header title="分类构成" :isLoading="loading" @type="onChangeNameType"></chart-header>
			<view class="name-charts">
				<view v-if="loading" class="loading">
					<com-loading></com-loading>
				</view>
				<view v-else-if="data.length > 0" class="name">
					<qiun-data-charts
						type="pie" :opts="namePieOpts" :chartData="nameChartData"
						:canvas2d="true" canvasId="details-name-pie-canvas-id"
						@getIndex="onClickNamePie"
					/>
				</view>
				<view v-else class="no-data">本月没有{{nameType === 0 ? '支出' : (nameType === 1 ? '收入' : '不计入收支')}}数据</view>
			</view>
			<uni-transition :mode-class="['fade','slide-top']" :show="isShowSubnameChart" :duration="500">
				<view class="subname-charts">
					<qiun-data-charts
						type="rose" :opts="subnamePieOpts" :chartData="subnameChartData"
						:canvas2d="true" canvasId="details-subname-pie-canvas-id"
					/>
				</view>
			</uni-transition>
		</view>
	</unicloud-db>
	<unicloud-db
		v-slot:default="{ data, loading, error }" collection="income-expend" :page-size="32"
		:where="`uid==$cloudEnv_uid&&time>=${beginTime}&&time<${endTime}&&type==${timeType}`" orderby="time asc"
		groupby="time" group-field="sum(money) as money, push(name, subname, money) as dataList"
		@load="loadTimeData"
	>
		<view v-if="error">{{error.message}}</view>
		<view v-else class="charts-container">
			<chart-header title="每日对比" :isLoading="loading" @type="onChangeTimeType"></chart-header>
			<view class="time-charts">
				<view v-if="loading" class="loading">
					<com-loading></com-loading>
				</view>
				<view v-else-if="data.length > 0" class="time">
					<qiun-data-charts
						type="column" :opts="timeColumnOpts" :chartData="timeChartData" :ontouch="true"
						:canvas2d="true" canvasId="details-time-column-canvas-id"
						@getIndex="onClickTimeColumn"
					/>
				</view>
				<view v-else class="no-data">本月没有{{timeType === 0 ? '支出' : (timeType === 1 ? '收入' : '不计入收支')}}数据</view>
			</view>
			<uni-transition :mode-class="['fade','slide-top']" :show="isShowTimeDetailsChart" :duration="500">
				<view class="time-details-charts">
					<qiun-data-charts
						type="rose" :opts="timeDetailsPieOpts" :chartData="timeDetailsChartData"
						:canvas2d="true" canvasId="details-time-details-pie-canvas-id"
					/>
				</view>
			</uni-transition>
		</view>
	</unicloud-db>
</template>

<script>
	import { ref } from 'vue'
	import { getYMDTime, getTimestamp } from '/utils/date.js'
	import { fixedMoney } from '/utils/money.js'
	import ComLoading from '/components/loading.vue'
	import ChartHeader from './chart-header.vue'
	import UdbError from '/components/udb-error.vue'

	export default {
		components: {
			ComLoading,
			ChartHeader,
			UdbError
		},
		setup () {
			const { year, monthStr, dayStr } = getYMDTime()
			const timestamp = getTimestamp()
			const date = ref(`${year}-${monthStr}`)
			const dateStr = ref(`${year}年${monthStr}月`)
			const dateEnd = ref(`${year}-${monthStr}`)
			const beginTime = ref(timestamp.beginTime)
			const endTime = ref(timestamp.endTime)
			const onChangeDate = e => {
				const time = e.detail.value
				const [ year, month ] = time.split('-')
				const changeTimestamp = getTimestamp(new Date(time))
				date.value = `${year}-${month}`
				dateStr.value = `${year}年${month}月`
				beginTime.value = changeTimestamp.beginTime
				endTime.value = changeTimestamp.endTime
				isShowSubnameChart.value = false
				isShowTimeDetailsChart.value = false
			}
			
			const totalIncome = ref(''), totalExpend = ref('')
			const loadIncomeExpendData = data => {
				// 先重置数据，防止当月无收入或支出时数据出错
				totalExpend.value = '0.00'
				totalIncome.value = '0.00'
				for (const { type, money } of data) {
					if (type === 0) totalExpend.value = fixedMoney(money)
					else if (type === 1) totalIncome.value = fixedMoney(money)
				}
			}
			
			const nameType = ref(0)
			const onChangeNameType = type => {
				nameType.value = type
				isShowSubnameChart.value = false
			}

			const namePieOpts = {
				legend: {
					position: 'top',
					lineHeight: 20
				},
				extra: {
					pie: {
						borderWidth: 2,
						offsetAngle: -90
					}
				}
			}
			let nameData = [] // 分类饼图的数据源，用于保存完整数据
			const nameChartData = ref({}) // 分类饼图所需的数据
			const loadNameData = data => {
				const arr = []
				for (const item of data) {
					arr.push({
						name: item.name,
						value: Number(fixedMoney(item.money)) // ucharts 中数值必须为数字，否则会直接导致卡死
					})
				}
				nameData = data
				exceptLegendData = data
				nameChartData.value = {
					series: [{
						data: arr
					}]
				}
			}
			
			const subnamePieOpts = {
				tooltipShow: true,
				legend: {
					position: 'top',
					lineHeight: 20
				},
				extra: {
					rose: {
						border: true,
						borderWidth: 2,
						offsetAngle: -90
					}
				}
			}
			const isShowSubnameChart = ref(false)
			const subnameChartData = ref({})
			let exceptLegendData = [] // 关闭图例后剩余的饼图数据
			let exceptLegend = [] // 关闭的图例名称列表
			const onClickNamePie = ({ currentIndex, legendIndex }) => {
				// 当点击空白处时 currentIndex 与 legendIndex 都为 -1，此时不做处理
				if (currentIndex === -1 && legendIndex === -1) return

				// 点击图例时 currentIndex 为 -1，此时需要对数据做一些处理
				if (currentIndex === -1) {
					const legendName = nameData[legendIndex].name // 获取点击的图例名称
					if (exceptLegend.includes(legendName)) { // 如果图例数组中存在图例名称，则表明是开启图例对应的饼图
						exceptLegend = exceptLegend.filter(item => item !== legendName) // 将开启的图例从图例数组中移除
						exceptLegendData = nameData.filter(item => !exceptLegend.includes(item.name)) // 从饼图数据源过滤掉关闭的图例数据
					} else { // 如果图例数组中不存在图例名称，则表明是关闭图例对应的饼图
						exceptLegend.push(legendName) // 关闭图例并将图例名称存进图例数组中
						exceptLegendData = exceptLegendData.filter(item => item.name !== legendName) // 将被关闭的图例从饼图数据中排除
					}
					isShowSubnameChart.value = false
					return
				}

				// 从关闭图例后剩余的饼图数据列表中取数据，保证下标与数据的准确性
				const { name, money, dataList } = exceptLegendData[currentIndex], obj = {}, arr = []
				for (const item of dataList) {
					if (item.subname) obj[item.subname] = (obj[item.subname] ? obj[item.subname] : 0) + item.money
					else obj[name] = money // 没有子类型，则直接显示该类型所有金额
				}
				for (const item in obj) {
					arr.push({
						name: item,
						value: Number(fixedMoney(obj[item]))
					})
				}
				subnameChartData.value = {
					series: [{
						data: arr,
						format: 'detailsPie' // 采用 uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js 中的方法来格式化显示内容
					}]
				}
				isShowSubnameChart.value = true
			}

			const timeType = ref(0)
			const onChangeTimeType = type => {
				timeType.value = type
				isShowTimeDetailsChart.value = false
			}

			const timeColumnOpts = {
				enableScroll: true,
				xAxis: {
					itemCount: 8,
					scrollShow: true
				},
				yAxis: {
					disabled: true,
					disableGrid: true
				},
				legend: {
					show: false
				},
				extra: {
					column: {
						width: 20
					}
				}
			}
			let timeData = [] // 每日对比柱状图的数据源
			const timeChartData = ref({}) // 对比柱状图所需的数据
			const loadTimeData = data => {
				const timeArr = [], moneyArr = []
				for (const item of data) {
					const { dayStr } = getYMDTime(new Date(item.time))
					timeArr.push(`${dayStr}号`)
					moneyArr.push(Number(fixedMoney(item.money)))
				}
				timeData = data
				timeChartData.value = {
					categories: timeArr,
					series: [{
						name: '金额',
            data: moneyArr
					}]
				}
			}

			const timeDetailsPieOpts = subnamePieOpts
			const isShowTimeDetailsChart = ref(false)
			const timeDetailsChartData = ref({})
			const onClickTimeColumn = e => {
				const currentIndex = e.currentIndex.index, legendIndex = e.legendIndex, arr = []
				
				// 点击空白处 currentIndex 和 legendIndex 都为 -1
				if (currentIndex === -1 && legendIndex === -1) return
				
				for (const item of timeData[currentIndex].dataList) {
					arr.push({
						name: item.name + (item.subname ? `-${item.subname}` : ''),
						value: Number(fixedMoney(item.money))
					})
				}
				
				timeDetailsChartData.value = {
					series: [{
						data: arr,
						format: 'detailsPie' // 采用 uni_modules/qiun-data-charts/js_sdk/u-charts/config-ucharts.js 中的方法来格式化显示内容
					}]
				}
				isShowTimeDetailsChart.value = true
			}

			return {
				date,
				dateStr,
				dateEnd,
				beginTime,
				endTime,
				onChangeDate,
				totalIncome,
				totalExpend,
				loadIncomeExpendData,
				nameType,
				onChangeNameType,
				namePieOpts,
				nameChartData,
				loadNameData,
				onClickNamePie,
				isShowSubnameChart,
				subnameChartData,
				subnamePieOpts,
				timeType,
				onChangeTimeType,
				timeColumnOpts,
				timeChartData,
				loadTimeData,
				timeDetailsPieOpts,
				isShowTimeDetailsChart,
				timeDetailsChartData,
				onClickTimeColumn
			}
		}
	}
</script>

<style lang="scss">
	.time-picker {
		display: inline-block;
		position: sticky;
		top: 0;
		font-size: 24rpx;
		background: var(--normal-background);
		padding: 10rpx 20rpx;
		border-radius: 6rpx;
		z-index: 1000;
	}
	
	.income-expend {
		width: 100%;
		height: 170rpx;
		border-bottom: 10rpx solid #f0f0f0;
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		.title {
			font-size: 28rpx;
			margin-bottom: 10rpx;
		}
		.money {
			font-size: 40rpx;
			font-weight: 500;
		}
		.income {
			color: var(--income-color);
		}
		.expend {
			color: var(--expend-color);
		}
		.flex-box {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}

	.charts-container {
		.name-charts, .time-charts {
			width: 100%;
			height: 600rpx;
			.loading {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.name, .time {
				width: 100%;
				height: 100%;
			}
			.no-data {
				text-align: center;
				line-height: 600rpx;
			}
		}
		.subname-charts, .time-details-charts {
			width: 100%;
			height: 600rpx;
		}
	}
</style>
