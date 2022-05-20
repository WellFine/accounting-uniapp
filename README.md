# accounting-uniapp
使用 uniapp + uniCloud 开发的记账本小程序，使用了云对象进行开发，需基于 HBuilder X 3.4.0 以上运行。

运行项目前需在 `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json` 中配置微信小程序的 `appid` 和 `appsecret`，以及支付宝小程序的 `appid`、`privateKey` 和 `keyType`。

# 错误码说明
- 10000：登录失败。
- 10001：用户信息错误。

- 11000：入账失败。
- 11001：修改收支记录时数据未变动。
- 11002：修改收支记录失败。
- 11003：删除收支记录失败。
- 11004：同步账户数据失败。

- 12000：设置账户失败。
- 12001：修改账户失败。

- 13000：ocr 识别不出内容。
