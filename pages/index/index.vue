<template>
	<unicloud-db
		v-slot:default="{ data, loading, error }" collection="account"
		where="uid==$cloudEnv_uid" :getone="true"
	>
		<view v-if="error">
			<udb-error :code="error.code"></udb-error>
		</view>
		<view v-else>
			<card :loading="loading" :data="data" />
			<can-use-money :useMoney="data && data.canUseMoney" :expendMoney="monthTotalExpend" :loading="loading" />
		</view>
	</unicloud-db>
	<unicloud-db
		v-slot:default="{ data, loading, error }"
		collection="income-expend"
		:where="where" orderby="time desc" :page-size="32"
		groupby="time" group-field="push(_id,type,name,py,subname,remark,money,account) as data"
		@load="loadIncomeExpendData"
	>
		<view v-if="error">{{error.message}}</view>
		<view v-else>
			<income-expend :income="monthTotalIncome" :expend="monthTotalExpend" />
			<list-header :loading="loading" @time="getTime" @type="getType"></list-header>
			<template v-if="data.length > 0" v-for="item in data" :key="item._id">
				<list-item :data="item"></list-item>
			</template>
			<view v-else class="no-data">暂无收支记录</view>
		</view>
	</unicloud-db>
</template>

<script>
	import Card from './card.vue'
	import IncomeExpend from './income-expend.vue'
	import CanUseMoney from './can-use-money.vue'
	import ListHeader from './list-header.vue'
	import ListItem from './list-item.vue'
	import UdbError from '/components/udb-error.vue'
	import { getTimestamp } from '/utils/date.js'

	export default {
		components: {
			Card,
			IncomeExpend,
			CanUseMoney,
			ListHeader,
			ListItem,
			UdbError
		},
		data () {
			return {
				beginTime: 0,
				endTime: 0,
				type: 3, // 3 为全部类型
				typeName: '',
				monthTotalIncome: 0,
				monthTotalExpend: 0,
				count: 0 // 加载 income-expend 表数据时用于保存本月收支的标识
			}
		},
		computed: {
			where () {
				// 判断 this.beginTime 与 this.endTime 是否等于 0 是为了兼容支付宝在刚进入时这两个值为 0 的情况
				const { beginTime, endTime } = getTimestamp()
				return `uid==$cloudEnv_uid&&time>=${this.beginTime == 0 ? beginTime : this.beginTime}&&time<${this.endTime == 0 ? endTime : this.endTime}`
							 + (this.type === 3 ? '' : `&&type==${this.type}`)
							 + (this.typeName ? `&&name=='${this.typeName}'` : '')
			}
		},
		methods: {
			getTime ({ beginTime, endTime }) {
				this.beginTime = beginTime
				this.endTime = endTime
			},
			getType ({ type, typeName }) {
				this.type = type
				// 3 为全部类型，不需要类型名称
				if (type === 3) {
					this.typeName = ''
				} else {
					this.typeName = typeName
				}
			},
			loadIncomeExpendData (data) {
				// 这个方法用于记录下本月的收支总额
				if (this.count === 0) {
					let income = 0, expend = 0
					
					for (const day of data) {
						for (const item of day.data) {
							if (item.type === 0) expend += item.money
							else if (item.type === 1) income += item.money
						}
					}
					
					this.count++
					this.monthTotalIncome = income
					this.monthTotalExpend = expend
				}
			}
		}
	}
</script>

<style scoped>
	.no-data {
		text-align: center;
		color: var(--normal-color);
		margin-top: 20rpx;
	}
</style>
