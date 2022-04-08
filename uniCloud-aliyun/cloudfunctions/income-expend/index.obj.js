const uniID = require('uni-id')
const db = uniCloud.database()
const dbCmd = db.command

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

		// 开启事务
		const transaction = await db.startTransaction()

		try {
			const { id } = await transaction.collection('income-expend').add({
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

			// 添加收支记录成功
			if (id) {
				// 阿里云事务只能使用 doc 查询 id，所以先获取账户 id
				const accountRes = await db.collection('account').where({
					uid
				}).get()
				const accountId = accountRes.data[0]._id
				const accountValue = accountRes.data[0][`${account}`]
				const changeMoney = money * 100

				// 如果没设置过账户余额，会没有账户数据，这里需要判断以下
				if (accountId) {
					// 不计入收支不需要同步账户数据
					if (type != 2) {
						try {
							// 当账户余额本来为 0 然后又支出时是不会修改内容的，所以无需判断修改数量
							await transaction.collection('account').doc(accountId).update({
								[`${account}`]: type == 0 ? (changeMoney >= accountValue ? 0 : dbCmd.inc(-changeMoney)) : dbCmd.inc(changeMoney)
							})

							await transaction.commit()
							return {
								errCode: 0,
								errMsg: '已入账',
								token,
								tokenExpired
							}
						} catch (e) {
							await transaction.rollback()
							return {
								errCode: 11004,
								errMsg: '同步账户数据失败，请稍后重试'
							}
						}
					}
				}
				
				// 如果没有设置过账户，即账户表无数据，则直接返回成功标识
				await transaction.commit()
				return {
					errCode: 0,
					errMsg: '已入账',
					token,
					tokenExpired
				}
			} else {
				// 添加收支记录失败
				await transaction.rollback()
				return {
					errCode: 11000,
					errMsg: '入账失败，请稍后重试'
				}
			}
		} catch (e) {
			await transaction.rollback()
			return {
				errCode: 11000,
				errMsg: '入账失败，请稍后重试'
			}
		}
	},
	/**
	 * @param {Object} id 修改的记录 id
	 * @param {Object} type 修改后的类型
	 * @param {Object} oldType 原类型
	 * @param {Object} time 修改时间
	 * @param {Object} money 修改后的金额，单位为分
	 * @param {Object} oldMoney 原金额，单位为分
	 * @param {Object} name 修改后类型名称
	 * @param {Object} py 类型拼音
	 * @param {Object} subname 修改后的子类型
	 * @param {Object} account 修改后账户
	 * @param {Object} oldAccount 原账户
	 * @param {Object} remark 修改后的备注
	 */
	async update (id, type, oldType, time, money, oldMoney, name, py, subname, account, oldAccount, remark) {
		const { code, uid } = await uniID.checkToken(this.getUniIdToken())

		if (code !== 0) {
			return {
				errCode: 10001,
				errMsg: '用户信息错误'
			}
		}

		// 开启事务
		const transaction = await db.startTransaction()

		try {
			const { updated } = await transaction.collection('income-expend').doc(id).update({
				type,
				time: Date.parse(time),
				money,
				name,
				py,
				subname,
				account,
				remark
			})

			if (updated > 0) {
				// 阿里云事务只能使用 doc 查询 id，所以先获取账户 id
				const accountRes = await db.collection('account').where({
					uid
				}).get()
				const accountId = accountRes.data[0]._id
				const accountValue = accountRes.data[0][`${account}`]

				// 如果没设置过账户余额，会没有账户数据，就不需要同步账户数据
				if (accountId) {
					try {
						if (account == oldAccount) { // 收支账户没有改变
							let changeMoney = 0
							if (type == oldType) { // 收支类型没有变化
								changeMoney = money - oldMoney
								if (type == 2) { // 更改前后都是不计入收支，则金额变化为 0
									changeMoney = 0
								}
								/**
								 * 当账户余额本来为 0 然后又支出时是不会修改内容的，所以无需判断修改数量
								 * 收支类型和收支账户都没有变化，变化的只有金额
								 * 此时如果是支出，金额变大则需从账户减去变大部分，当账户余额不足与减去，则设为 0；金额变小则加上变小部分
								 * 如果是收入，金额变大则加上变大部分；金额变小则减去变小部分，如果账户余额不足与减去，则设为 0
								 * 如果是不计入收支，在上面已经设置金额变化为 0
								 */
								await transaction.collection('account').doc(accountId).update({
									[`${account}`]: type == 0
										? (changeMoney > 0 ? (accountValue > changeMoney ? dbCmd.inc(-changeMoney) : 0) : dbCmd.inc(Math.abs(changeMoney)))
										: (changeMoney > 0 ? dbCmd.inc(changeMoney) : (accountValue > Math.abs(changeMoney) ? dbCmd.inc(changeMoney) : 0))
								})
							} else { // 收支类型变化
								/**
								 * 修改前类型为支出：修改后为收入则加上金额变化部分，变化部分为修改前金额加上修改后金额；修改后为不计入收支，则加上金额变化部分，变化部分为修改前金额
								 * 修改前类型为收入：修改后为支出则减去金额变化部分，变化部分为修改前金额加上修改后金额；修改后为不计入收支，则减去金额变化部分，变化部分为修改前金额；减去时注意账户余额最小为 0
								 * 修改前类型为不计入收支，则金额变化为修改后金额，加减看情况
								 */
								if (oldType == 0) changeMoney = (type == 1 ? money + oldMoney : oldMoney)
								else if (oldType == 1) changeMoney = -Math.min(accountValue, (type == 0 ? money + oldMoney : oldMoney))
								else if (oldType == 2) changeMoney = (type == 0 ? -Math.min(accountValue, money) : money)
								await transaction.collection('account').doc(accountId).update({
									[`${account}`]: dbCmd.inc(changeMoney)
								})
							}
						} else { // 收支账户改变了
							const oldAccountValue = accountRes.data[0][`${oldAccount}`]
							/**
							 * 此时如果是支出，原支出账户需要增加原支出金额；修改后的账户需要减去修改后的金额，不足与减去就设为 0
							 * 如果是收入，原收入账户需要减去原收入金额，不足以减去就设为 0；修改后的账户需要加上修改后的金额
							 * 如果是不计入收支，则账户余额不变
							 */
							await transaction.collection('account').doc(accountId).update({
								[`${oldAccount}`]: oldType == 2 ? oldAccountValue : (oldType == 0 ? dbCmd.inc(oldMoney) : (oldAccountValue > oldMoney ? dbCmd.inc(-oldMoney) : 0)),
								[`${account}`]: type == 2 ? accountValue : (type == 0 ? (accountValue > money ? dbCmd.inc(-money) : 0) : dbCmd.inc(money))
							})
						}

						await transaction.commit()
						return {
							errCode: 0,
							errMsg: '修改成功'
						}
					} catch (e) {
						await transaction.rollback()
						return {
							errCode: 11004,
							errMsg: '同步账户数据失败，请稍后重试'
						}
					}
				}

				// 修改成功且无需同步账户
				await transaction.commit()
				return {
					errCode: 0,
					errMsg: '修改成功'
				}
			} else {
				await transaction.rollback()
				return {
					errCode: 11001,
					errMsg: '数据没有变化呀'
				}
			}
		} catch (e) {
			await transaction.rollback()
			return {
				errCode: 11002,
				errMsg: '数据修改失败，请稍后重试'
			}
		}
	},
	/**
	 * @param {Object} id 删除的记录 id
	 * @param {Object} type 收支类型
	 * @param {Object} money 收支金额
	 * @param {Object} account 收支账户
	 */
	async delete (id, type, money, account) {
		const { code, uid } = await uniID.checkToken(this.getUniIdToken())
		
		if (code !== 0) {
			return {
				errCode: 10001,
				errMsg: '用户信息错误'
			}
		}
		
		// 开启事务
		const transaction = await db.startTransaction()

		try {
			const { deleted } = await transaction.collection('income-expend').doc(id).remove()
			if (deleted > 0) {
				// 阿里云事务只能使用 doc 查询 id，所以先获取账户 id
				const accountRes = await db.collection('account').where({
					uid
				}).get()
				const accountId = accountRes.data[0]._id
				const accountValue = accountRes.data[0][`${account}`]

				// 如果没设置过账户余额，会没有账户数据，就不需要同步账户数据
				if (accountId) {
					try {
						/**
						 * 这里不判断修改数量是因为删除不计入收支的数据时，账户余额不变，则修改数量为 0
						 * 类型为不计入收支，则账户余额不变；类型为支出，则加上对应金额；类型为收入，则减去对应金额，注意余额最低为 0
						 */
						await transaction.collection('account').doc(accountId).update({
							[`${account}`]: type == 2 ? accountValue : (type == 0 ? dbCmd.inc(money) : (accountValue > money ? dbCmd.inc(-money) : 0))
						})

						await transaction.commit()
						return {
							errCode: 0,
							errMsg: '删除成功'
						}
					} catch (e) {
						await transaction.rollback()
						return {
							errCode: 11004,
							errMsg: '同步账户数据失败，请稍后重试'
						}
					}
				}
				
				// 删除成功且无需同步账户
				await transaction.commit()
				return {
					errCode: 0,
					errMsg: '删除成功'
				}
			} else {
				await transaction.rollback()
				return {
					errCode: 11003,
					errMsg: '删除失败，请稍后重试'
				}
			}
		} catch (e) {
			await transaction.rollback()
			return {
				errCode: 11003,
				errMsg: '删除失败，请稍后重试'
			}
		}
	}
}
