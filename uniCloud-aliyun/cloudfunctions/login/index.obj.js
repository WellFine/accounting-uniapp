const uniID = require('uni-id')
	
module.exports = {
	async loginByWeixin (loginCode) {
		const { code, token, tokenExpired } = await uniID.loginByWeixin({
			code: loginCode
		})
		
		if (code === 0) {
			return {
				token,
				tokenExpired
			}
		} else {
			return {
				errCode: 10000,
				errMsg: '登录失败，请稍后重试'
			}
		}
	}
}
