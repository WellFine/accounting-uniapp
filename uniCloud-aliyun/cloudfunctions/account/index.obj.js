const uniID = require('uni-id')
	
module.exports = {
	async add (wechat, alipay, bank, cash, canUseMoney) {
		const { code, uid, token, tokenExpired } = await uniID.checkToken(this.getUniIdToken())

		if (code !== 0) {
			return {
				errCode: 10001,
				errMsg: '用户信息错误'
			}
		}
		
		const db = uniCloud.database()
		const collection = db.collection('account')

		try {
			await collection.add({
				uid,
				wechat: wechat * 100,
				alipay: alipay * 100,
				bank: bank * 100,
				cash: cash * 100,
				canUseMoney: canUseMoney * 100
			})
		
			return {
				errCode: 0,
				errMsg: '设置成功',
				token,
				tokenExpired
			}
		} catch (e) {			
			return {
				errCode: 12000,
				errMsg: '设置失败，请稍后重试'
			}
		}
	},
	async update (wechat, alipay, bank, cash, canUseMoney) {
		const { code, uid, token, tokenExpired } = await uniID.checkToken(this.getUniIdToken())
		
		if (code !== 0) {
			return {
				errCode: 10001,
				errMsg: '用户信息错误'
			}
		}
		
		const db = uniCloud.database()
		const collection = db.collection('account')
		
		try {
			await collection.where({
				uid
			}).update({
				wechat: wechat * 100,
				alipay: alipay * 100,
				bank: bank * 100,
				cash: cash * 100,
				canUseMoney: canUseMoney * 100
			})
		
			return {
				errCode: 0,
				errMsg: '修改成功',
				token,
				tokenExpired
			}
		} catch (e) {
			console.log(e)
			return {
				errCode: 12001,
				errMsg: '修改失败，请稍后重试'
			}
		}
	}
}
