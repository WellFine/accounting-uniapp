<template>
	<view class="search-input">
		<uni-search-bar
			v-model="keyword" :focus="true" bgColor="#fff" cancelButton="none"
			@confirm="onSearch" @clear="onClearInput"
		></uni-search-bar>
	</view>
	<view class="add-conditions">
		<uni-card title="添加筛选条件" extra="搜索" :isFull="true" @click="onClickConditionsCard">
			<uni-datetime-picker type="daterange" :end="nowTime" @change="onChangeTime"></uni-datetime-picker>
			<view class="type">
				<view>搜索类型：</view>
				<radio-group class="type-group" name="type" @change="onChangeType">
					<label>
						<radio value="3" :checked="true" /><text>全部</text>
					</label>
					<label>
						<radio value="0" /><text>支出</text>
					</label>
					<label>
						<radio value="1" /><text>收入</text>
					</label>
					<label>
						<radio value="2" /><text>不计入收支</text>
					</label>
				</radio-group>
			</view>
		</uni-card>
	</view>
	<uni-transition :mode-class="['fade', 'slide-left']" :show="!isShowSearchResult" :duration="300">
		<view class="history">
			<uni-card title="历史记录" extra="清空历史记录" :isFull="true" @click="onClickHistoryCard">
				<view v-if="keywordList.length === 0" class="no-history">暂无历史记录</view>
				<view v-else class="history-list">
					<template v-for="(item, index) in keywordList" :key="index">
						<view class="history-item">
							<uni-icons type="link" :size="24"></uni-icons>
							<text class="content" @click="onSearch(item)">{{ item }}</text>
							<uni-icons type="clear" :size="20" color="#c0c4cc" @click="onDeleteHistoryItem(index)"></uni-icons>
						</view>
					</template>
				</view>
			</uni-card>
		</view>
	</uni-transition>
	<unicloud-db
		ref="udb" v-slot:default="{ data, loading, error, hasMore, pagination }" collection="income-expend"
		:where="where" loadtime="manual" orderby="time desc"
	>
		<uni-transition :mode-class="['fade', 'slide-bottom']" :show="isShowSearchResult" :duration="300">
			<view class="udb">
				<uni-card title="搜索结果" extra="返回历史记录" :isFull="true" @click="onClickSearchResultCard">
					<view v-if="error">
						<udb-error :code="error.code"></udb-error>
					</view>
					<view v-else-if="loading" class="loading">
						<com-loading></com-loading>
					</view>
					<view v-else>
						<view v-if="data.length > 0" class="search-result-list">
							<template v-for="item in data" :key="item._id">
								<view class="search-result-item" @click="onClickSearchResultItem(item)">
									<view class="left">
										<view class="name">{{ `${item.name} ${item.subname ? item.subname : ''}` }}</view>
										<view class="remark">{{ item.remark }}</view>
									</view>
									<view class="right">
										<view class="time">{{ getDateStr(item.time) }}</view>
										<view class="money">{{ item.type === 0 ? '-' : (item.type === 1 ? '+' : '') }}￥{{ fixedMoney(item.money) }}</view>
									</view>
								</view>
							</template>
							<view v-if="hasMore" class="load-more" @click="onClickLoadMore">加载更多数据</view>
						</view>
						<view v-else class="no-search-result">找不到有关{{keyword}}的记录</view>
					</view>
				</uni-card>
			</view>
		</uni-transition>
	</unicloud-db>
</template>

<script>
	import { ref, computed, nextTick } from 'vue'
	import { getYMDTime } from '/utils/date.js'
	import { fixedMoney } from '/utils/money.js'
	import ComLoading from '/components/loading.vue'
	import UdbError from '/components/udb-error.vue'

	export default {
		components: {
			ComLoading,
			UdbError
		},
		setup () {
			const keyword = ref('')
			const isShowSearchResult = ref(false)
			const onSearch = value => {
				// 当通过键盘触发 uni-search-bar 的 confirm 事件时，会传入参数 value.value
				// 当点击历史记录时，直接传入 value 值
				if (value) keyword.value = value.value ? value.value : value

				if (keyword.value === '') {
					uni.showToast({
						icon: 'none',
						title: '请输入关键词'
					})
					return
				}

				nextTick(() => {
					isShowSearchResult.value = true
					udb.value.loadData({ clear: true })
					setKeywordList()
				})
			}
			const onClearInput = () => {
				isShowSearchResult.value = false
			}
			
			const onClickConditionsCard = e => {
				if (e === 'extra') {
					onSearch()
				}
			}

			const { year, monthStr, dayStr } = getYMDTime()
			const beginTime = ref(0)
			const endTime = ref(Date.parse(`${year}-${monthStr}-${dayStr}`))
			const nowTime = ref(endTime.value)
			const onChangeTime = e => {
				// 点击清除按钮
				if (e.length === 0) {
					beginTime.value = 0
					endTime.value = nowTime.value
				} else {
					beginTime.value = Date.parse(e[0])
					endTime.value = Date.parse(e[1])
				}
			}

			const searchType = ref(3)
			const onChangeType = e => {
				searchType.value = e.detail.value
			}
			
			const list = uni.getStorageSync('search_history')
			const keywordList = ref(list ? list : [])
			const setKeywordList = () => {
				const index = keywordList.value.indexOf(keyword.value)
				if (index !== -1) keywordList.value = keywordList.value.filter(item => item !== keyword.value)
				keywordList.value.unshift(keyword.value)
				if (keywordList.value.length > 30) keywordList.value.pop()
				uni.setStorageSync('search_history', keywordList.value)
			}
			const onClickHistoryCard = e => {
				if (e === 'extra') {
					keywordList.value = []
					uni.setStorageSync('search_history', [])
				}
			}
			const onDeleteHistoryItem = itemIndex => {
				keywordList.value = keywordList.value.filter((item, index) => index !== itemIndex)
				uni.setStorageSync('search_history', keywordList.value)
			}

			const udb = ref(null)
			const where = computed(() => {
				// jql 语法中数组只支持常量，所以 new RegExp().test() 无法用数组直接概括 name、subname、remark 三个属性
				let res = `uid==$cloudEnv_uid&&time>=${beginTime.value}&&time<=${endTime.value}&&(${new RegExp(keyword.value)}.test(name)||${new RegExp(keyword.value)}.test(subname)||${new RegExp(keyword.value)}.test(remark))`
				if (searchType.value != 3) res += `&&type==${searchType.value}`
				return res
			})
			const onClickSearchResultCard = e => {
				if (e === 'extra') {
					isShowSearchResult.value = false
					keyword.value = ''
				}
			}
			const getDateStr = timestamp => {
				const { year, monthStr, dayStr } = getYMDTime(new Date(timestamp))
				return `${year}年${monthStr}月${dayStr}日`
			}
			const onClickLoadMore = () => {
				udb.value.loadMore()
			}
			const onClickSearchResultItem = item => {
				uni.navigateTo({
					url: `/pages/add/add?data=${JSON.stringify(item)}&&time=${item.time}`
				})
			}

			return {
				keyword,
				isShowSearchResult,
				onSearch,
				onClearInput,
				onClickConditionsCard,
				nowTime,
				onChangeTime,
				onChangeType,
				keywordList,
				onClickHistoryCard,
				onDeleteHistoryItem,
				udb,
				where,
				onClickSearchResultCard,
				getDateStr,
				onClickLoadMore,
				onClickSearchResultItem,
				fixedMoney
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background: #f9fafe;
		.search-input {
			background: #fff;
			border-radius: 10rpx;
			box-shadow: 0 0 10rpx 5rpx rgba(94, 73, 73, 0.1);
			margin: 10rpx 0 30rpx;
		}
		.add-conditions {
			margin-bottom: 30rpx;
			radio {
				transform: scale(.8);
			}
			.type {
				display: flex;
				margin-top: 20rpx;
				.type-group {
					flex: 1;
					display: grid;
					grid-template-columns: 35% 65%;
					grid-template-rows: 50rpx 50rpx;
				}
			}
		}
		.history {
			.no-history {
				text-align: center;
			}
			.history-list {
				.history-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 16rpx 0;
					.content {
						flex: 1;
						margin: 0 20rpx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
				.history-item + .history-item {
					border-top: 2rpx solid #dcdcdc;
				}
			}
		}
		.udb {
			.loading {
				display: flex;
				justify-content: center;
			}
			.search-result-list {
				.search-result-item {
					display: flex;
					justify-content: space-between;
					padding: 12rpx 0;
					.left {
						flex: 1;
					}
					.right {
						.money {
							text-align: right;
						}
					}
					.name, .money {
						font-size: 32rpx;
					}
					.remark, .time {
						font-size: 24rpx;
						color: #909399;
					}
				}
				.search-result-item + .search-result-item {
					border-top: 2rpx solid #dcdcdc;
				}
				.load-more {
					color: var(--expend-color);
					text-align: center;
				}
			}
			.no-search-result {
				text-align: center;
			}
		}
	}
</style>
