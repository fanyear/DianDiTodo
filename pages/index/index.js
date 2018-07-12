//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        update: 0,
        date: '',
        day: '',
        hi: ''
    },
    add: function () {
        wx.navigateTo({
            url: '../add/add?type=0',
        })
    },
    selctType: function () {
        let list = ['学习', '生活', '工作', '运动']
        wx.showActionSheet({
            itemList: list,
            itemColor: '#65c0ba',
            success: function (res) {
                wx.navigateTo({
                    url: '../type/type?taskType=' + list[res.tapIndex],
                })
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
        
    },
    about: function () {
        wx.navigateTo({
            url: '../about/about',
        })
    },
    onShow: function () {
        this.setData({
            update: ++this.data.update
        })
        this.getTime()
    },
    getTime: function () {
        let time = new Date()
        let date = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
        let day = `星期${app.globalData.days[time.getDay()]}`
        let hour = time.getHours()
        let hi = ''
        app.globalData.timeTypes.map((item) => {
            if (item.start <= hour && hour <= item.end) {
                hi = item.content
            }
        })
        this.setData({
            date: this.dealTime(date, '-'),
            day: day,
            hi: hi
        })
    },
    // 时间加零
    dealTime: function (time, symb) {
        return time.split(symb).map(item => {
            if (item.length === 1) {
                item = '0' + item
            }
            return item
        }).join(symb)
    },
    onShareAppMessage: function (ops) {
        return {
            title: ' ',
            path: 'pages/index/index',
            imageUrl: '/assets/img/share.png'
        }
    }
})
