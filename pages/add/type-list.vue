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
			type: Number,
			typeName: String, // 传了 typeName 就表示想要选中类型列表中与其值对应的类型
			subname: String // 想选中的子类型
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
				return this.type === 0 ? expendType :
							 this.type === 1 ? incomeType :
							 this.type === 2 ? otherType : null
			},
			color () {
				return this.type === 0 ? '#69c0ff' :
							 this.type === 1 ? '#73d13d' :
							 this.type === 2 ? '#b37feb' : ''
			},
			computedIndex () {
				if (this.typeName) {
					for (let i = 0; i < this.list.length; i++) {
						const item = this.list[i]
						if (item.type === this.typeName) {
							this.$emit('getType', {
								type: item,
								index: this.subname ? item.subname.indexOf(this.subname) : undefined
							})
							return i
						}
					}
					return 0
				} else {
					return 0
				}
			}
		},
		watch: {
			computedIndex (val) {
				this.activeIndex = val
			},
			// 页面切换 type 时重置下标
			type () {
				this.$nextTick(() => {
					this.activeIndex = 0
				})
			}
		},
		methods: {
			switchType (typeIndex) {
				const type = this.list[typeIndex]
				
				this.activeIndex = typeIndex
				
				this.$emit('getType', { type, index: 0 })
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
