<template>
	<!-- <card />
	<income-expend />
	<can-use-money /> -->
	<unicloud-db
		v-slot:default="{ data, loading, error }"
		collection="income-expend"
		:where="where" orderby="time desc"
		groupby="time" group-field="push(type,name,py,subname,remark,money) as data"
	>
		<view v-if="error">{{error.message}}</view>
		<!-- <view v-else-if="loading">
			加载动画
		</view> -->
		<view v-else>
			<list-header @time="getTime" @type="getType"></list-header>
			<template v-for="item in data" :key="item._id">
				<list-item :data="item"></list-item>
			</template>
		</view>
	</unicloud-db>
</template>

<script>
	import Card from './card.vue'
	import IncomeExpend from './income-expend.vue'
	import CanUseMoney from './can-use-money.vue'
	import ListHeader from './list-header.vue'
	import ListItem from './list-item.vue'
	
	import { getTimestamp } from '/utils/date.js'

	export default {
		components: {
			Card,
			IncomeExpend,
			CanUseMoney,
			ListHeader,
			ListItem
		},
		data () {
			return {
				beginTime: 0,
				endTime: 0,
				type: 3, // 3 为全部类型
				typeName: ''
			}
		},
		computed: {
			where () {
				return `uid==$cloudEnv_uid&&time>=${this.beginTime}&&time<${this.endTime}`
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
			}
		}
	}
</script>

<style>
	
</style>
