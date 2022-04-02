<script>
	const db = uniCloud.database()

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

			// 全局处理 clientDB（unicloud-db 组件）发送请求时回传的 token 与错误事件
			const refreshToken = ({ token, tokenExpired }) => {
				// clientDB 发送请求后回传的 token 直接存入缓存中
				uni.setStorageSync('uni_id_token', token)
				uni.setStorageSync('uni_id_token_expired', tokenExpired)
			}
			const onDBError = ({ code, message }) => {
				// clientDB 发送请求出错，这里判断如果是 token 过期就跳登录页
				if (code === 'TOKEN_INVALID_TOKEN_EXPIRED') {
					uni.showToast({
						icon: 'none',
						title: '登录过期，请重新登录',
						duration: 1000,
						success: () => {
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/login'
								})
							}, 1000)
						}
					})
				}
			}
			db.on('refreshToken', refreshToken)
			db.on('error', onDBError)
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
