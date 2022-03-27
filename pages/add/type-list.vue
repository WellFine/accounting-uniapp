<template>
	<view class="list">
		<template v-for="(item, index) in list" :key="item.py">
			<view class="type" @click="switchType(index)">
				<type-icon
					:type="index === activeIndex ? item.py : item.py + '-dark'"
					:color="index === activeIndex ? color : normalBackground"
				></type-icon>
				<text :style="{ color: index === activeIndex ? color : normalColor }">{{ item.type }}</text>
			</view>
		</template>
	</view>
</template>

<script>
	import TypeIcon from '/components/type-icon.vue'
	import { expendType, incomeType, otherType } from '/config/type.js'

	export default {
		components: {
			TypeIcon
		},
		props: {
			listName: {
				type: String,
				required: true
			}
		},
		data () {
			return {
				activeIndex: 0,
				normalColor: '#8c8c8c',
				normalBackground: '#f5f5f5'
			}
		},
		computed: {
			list () {
				return this.listName === 'expend' ? expendType :
							 this.listName === 'income' ? incomeType :
							 this.listName === 'other' ? otherType : null
			},
			color () {
				return this.listName === 'expend' ? '#69c0ff' :
							 this.listName === 'income' ? '#73d13d' :
							 this.listName === 'other' ? '#b37feb' : ''
			}
		},
		methods: {
			switchType (typeIndex) {
				const type = this.list[typeIndex]
				
				this.activeIndex = typeIndex
				
				this.$emit('getType', type)
			}
		}
	}
</script>

<style lang="scss">
	.list {
		display: grid;
		grid-template-columns: repeat(7, 14.28%);
		
		.type {
			margin-bottom: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			
			text {
				font-size: 24rpx;
				margin-top: 8rpx;
			}
		}
	}
</style>
