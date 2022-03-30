const uniID = require('uni-id')
const db = uniCloud.database()
const collection = db.collection('income-expend')

module.exports = {
	/**
	 * @param {integer} type 0 支出，1 收入，2 不计入收支
	 * @param {string} time 记录时间
	 * @param {string} money 金额
	 * @param {string} name 分类名称
	 * @param {string} py 分类拼音
	 * @param {string} subname 子分类名称
	 * @param {string} account 收支账户
	 * @param {string} remark 备注
	 */
	async add (type, time, money, name, py, subname, account, remark) {
		const { code, uid, token, tokenExpired } = await uniID.checkToken(this.getUniIdToken())

		if (code !== 0) {
			return {
				errCode: 10001,
				errMsg: '用户信息错误'
			}
		}

		try {
			await collection.add({
				uid,
				type,
				time: Date.parse(time),
				money: money * 100,
				name,
				py,
				subname,
				account,
				remark
			})

			return {
				errCode: 0,
				errMsg: '已入账',
				token,
				tokenExpired
			}
		} catch (e) {			
			return {
				errCode: 11000,
				errMsg: '入账失败，请稍后重试'
			}
		}
	},
	async update (id, type, time, money, name, py, subname, account, remark) {
		try {
			const { updated } = await collection.where({
				_id: id
			}).update({
				type,
				time: Date.parse(time),
				money: money * 100,
				name,
				py,
				subname,
				account,
				remark
			})
			
			if (updated > 0) {
				return {
					errCode: 0,
					errMsg: '修改成功'
				}
			} else {
				return {
					errCode: 11001,
					errMsg: '数据没有变化呀'
				}
			}
		} catch (e) {
			return {
				errCode: 11002,
				errMsg: '数据修改失败，请稍后重试'
			}
		}
	},
	async delete (id) {
		try {
			const { deleted } = await collection.doc(id).remove()
			if (deleted > 0) {
				return {
					errCode: 0,
					errMsg: '删除成功'
				}
			}
		} catch (e) {
			return {
				errCode: 11003,
				errMsg: '删除失败，请稍后重试'
			}
		}
	}
}
