class Type {
  /**
   * @param {string} type 类型名称
   * @param {string} py 类型名称拼音
   */
  constructor (type, py) {
    this.type = type
    this.py = py
  }
}

class Food extends Type {
  subname = ['早餐', '午饭', '下午茶', '晚餐', '夜宵', '饮品', '甜品', '其它']

  constructor () {
    super('餐饮', 'canyin')
  }
}

class Vehicle extends Type {
  subname = ['共享单车', '公交', '地铁', '打车', '共享汽车', '高铁', '火车', '飞机', '大巴', '其它']

  constructor () {
    super('交通', 'jiaoton')
  }
}

class Shopping extends Type {
  subname = ['日用品', '食材', '水果', '零食', '饮料', '电子产品', '娱乐产品', '其它']

  constructor () {
    super('购物', 'gouwu')
  }
}

class Apparel extends Type {
  subname = ['衣服', '裤子', '鞋子', '其它']

  constructor () {
    super('服饰', 'fushi')
  }
}

class Educate extends Type {
  subname = ['学费', '网课费用', '买书', '其它']

  constructor () {
    super('教育', 'jiaoyu')
  }
}

class Pay extends Type {
  subname = ['电费', '水费', '话费', '燃气费', '油费', '停车费', '宽带', '物业', '房贷', '团费', '党费', '其它']

  constructor () {
    super('缴费', 'jiaofei')
  }
}

class Daily extends Type {
  subname = ['快递', '理发', '会员', '买优惠券', '其它']

  constructor () {
    super('日常', 'richang')
  }
}

class Entertainment extends Type {
  subname = ['体育', '电影', '游乐场', 'KTV', '茶室', '酒吧', '网吧', '其它']

  constructor () {
    super('娱乐', 'yule')
  }
}

class Sport extends Type {
  subname = ['健身', '运动装备', '水', '其它']

  constructor () {
    super('运动', 'yundon')
  }
}

class Invest extends Type {
  subname = ['基金', '股票', '债券', '彩票', '其它']

  constructor () {
    super('投资', 'touzi')
  }
}

class Pet extends Type {
  subname = ['迎接主子', '粮食', '零食', '玩具', '洗澡', '治疗', '其它']

  constructor () {
    super('宠物', 'chongwu')
  }
}

class Medical extends Type {
  subname = ['就医', '拿药', '换药', '挂号', '其它']

  constructor () {
    super('医疗', 'yiliao')
  }
}

class HumanFeelings extends Type {
  subname = ['聚餐', '请客', '礼物', '其它']

  constructor () {
    super('人情', 'renqing')
  }
}

class Insurance extends Type {
  subname = ['养老保险', '医疗保险', '失业保险', '汽车保险', '其它保险']

  constructor () {
    super('保险', 'baoxian')
  }
}

export {
  Type,
  Food,
  Vehicle,
  Shopping,
  Apparel,
  Educate,
  Pay,
  Daily,
  Entertainment,
  Sport,
  Invest,
  Pet,
  Medical,
  HumanFeelings,
  Insurance
}
