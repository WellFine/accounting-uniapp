<template>
	<view
		class="text" :style="`transform: translate(${x}px, ${y}px);`"
		@touchstart="start" @touchmove.prevent="move" @touchend="end"
	>{{ text }}</view>
</template>

<script>
	export default {
		props: {
			text: ''
		},
		data () {
			return {
				x: 0,
				y: 0,
				startX: 0,
				startY: 0
			}
		},
		methods: {
			start (e) {
				const { clientX, clientY } = e.changedTouches[0]
				this.startX = clientX
				this.startY = clientY
			},
			move (e) {
				const { clientX, clientY } = e.changedTouches[0]
				this.x = clientX - this.startX
				this.y = clientY - this.startY
				this.$emit('move')
			},
			end (e) {
				const { clientX, clientY } = e.changedTouches[0]
				this.x = 0
				this.y = 0
				this.$emit('moveEnd', {
					y: clientY,
					value: this.text
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.text {
		font-size: 28rpx;
		color: var(--normal-color);
		padding: 20rpx;
		border-radius: 10rpx;
		border: 2rpx dashed var(--normal-color);
		margin: 0 10rpx 10rpx 0;
	}
</style>
