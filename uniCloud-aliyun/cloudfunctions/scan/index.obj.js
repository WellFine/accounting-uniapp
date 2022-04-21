const getAccessToken = async () => {
	const apiKey = 'vw0zC0WM54UVBa8hUkaadgPC'
	const secretKey = 'rPApnPM7rMjVQf5AtBEUpts2KVxm9TxT'
	const res = await uniCloud.httpclient.request(
		`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`, {
		method: 'POST',
		dataType: 'json',
		agent: false,
	})
	return res.data.access_token
}

module.exports = {
	async imageOcr (base64Img) {
		const accessToken = await getAccessToken()
		const { data } = await uniCloud.httpclient.request(
			`https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`, {
			method: 'POST',
			dataType: 'json',
			contentType: 'application/x-www-form-urlencoded',
			data: {
				image: encodeURI(base64Img),
				language_type: 'CHN_ENG', // 中英混合
				detect_direction: true // 检测图像朝向
			}
		})
		if (data.words_result_num > 0) {
			return {
				errCode: 0,
				errMsg: '识别成功',
				...data
			}
		} else {
			return {
				errCode: 13000,
				errMsg: '识别不出内容，换一张图片试试吧'
			}
		}
	}
}
