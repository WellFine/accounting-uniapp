<script>
	export default {
		onLaunch: function () {
			uni.checkSession({
				success: () => {
					this.globalData.isLogin = true
				},
				fail: () => {
					this.globalData.isLogin = false
					uni.showToast({
						icon: "none",
						title: '登录后体验更多功能',
						duration: 2000
					})
				}
			})
		},
		globalData: {
			isLogin: false
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
