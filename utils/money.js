/**
 * 限制金额只能有一个小数点且小数点后数字最多 2 位
 * @param {string} money 金额数值
 */
function makeMoneyTrue (money) {
	const arr = money.split('.')
	let [ integer, decimal ] = arr

	// 如果以 0 开头且长度大于 1, 则删除开头的 0
	if (integer.startsWith('0') && integer.length > 1) {
		integer = integer.slice(1, 2)
		money = integer
	}
	
	// 只能输入一个小数点
	if (arr.length > 2) money = `${integer}.${decimal}`

	// 如果小数点后的数字超过两位, 则保留两位
	if (decimal && decimal.length > 2) {
		decimal = decimal.slice(0, 2)
		money = `${integer}.${decimal}`
	}
	
	// 如果以小数点开头，则补一个零
	if (money.startsWith('.')) money = `0${money}`

	return money
}

/**
 * 将传入金额的单位从分转为元，转换为带小数点形式
 * @param {number} money 金额
 */
function fixedMoney (money) {
	return Number(money / 100).toFixed(2)
}

export {
	makeMoneyTrue,
	fixedMoney
}
