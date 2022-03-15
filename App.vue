<script>
	export default {
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	
	page {
		--normal-color: #8c8c8c;
		--normal-background: #f5f5f5;
		--expend-color: #40a9ff;
		--expend-background: #bae7ff;
		--income-color: #73d13d;
		--income-background: #d9f7be;
		--other-color: #9254de;
		--other-background: #efdbff;
		box-sizing: border-box;
		padding: 0 50rpx 20rpx;
	}
</style>
