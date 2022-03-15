<template>
	<view class="container">
		<com-card />
		<com-income-expend />
		<com-can-use-money />
	</view>
</template>

<script>
	import ComCard from './card.vue'
	import ComIncomeExpend from './income-expend.vue'
	import ComCanUseMoney from './can-use-money.vue'

	export default {
		components: {
			ComCard,
			ComIncomeExpend,
			ComCanUseMoney
		}
	}
</script>

<style>
	
</style>
