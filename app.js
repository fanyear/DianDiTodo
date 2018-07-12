//app.js
App({
    onLaunch: function () {

        console.log('onLaunch')
    
        wx.BaaS = requirePlugin('sdkPlugin')
        //让插件帮助完成登录、支付等功能
        wx.BaaS.wxExtend(wx.login, wx.getUserInfo, wx.requestPayment)

        let clientID = this.globalData.clientId
        wx.BaaS.init(clientID)

        // 微信用户登录小程序
        wx.BaaS.login(false).then(res => {
            // 登录成功
            console.log('登录成功', res)
            this.globalData.userInfo = res
        }, res => {
            // 登录失败
            console.log('登录失败', res)
        })
        
        // 欢迎数据
        let welcomeFinishedList = [
            { content: '已完成事项', time: '', date: '', taskType: '', operator: false, taskId: 1 }
            // { content: '已完成事项2', time: '', date: '', taskType: '生活', operator: false, taskId: 22 },
            // { content: '已完成事项3', time: '', date: '', taskType: '工作', operator: false, taskId: 17 },
            // { content: '已完成事项4', time: '', date: '', taskType: '工作', operator: false, taskId: 16 },
            // { content: '已完成事项5', time: '', date: '', taskType: '工作', operator: false, taskId: 15 },
            // { content: '已完成事项6', time: '', date: '', taskType: '工作', operator: false, taskId: 14 },
            // { content: '已完成事项7', time: '', date: '', taskType: '工作', operator: false, taskId: 13 },
            // { content: '已完成事项8', time: '', date: '', taskType: '工作', operator: false, taskId: 12 },
            // { content: '已完成事项9', time: '', date: '', taskType: '工作', operator: false, taskId: 11 }
        ]
        let welcomeUnfinishedList = [
            { content: '您的第一个待办事项', time: '', date: '', shortDate: '', taskType: '', operator: false, taskId: 11 },
            // { content: '点左边方格，完成此待办事项', time: '', date: '', taskType: '', operator: false, taskId: 2 },
            // { content: '点下方+按钮，添加待办事项', time: '', date: '', taskType: '', operator: false, taskId: 5 },
            // { content: '点此事项，显示事项处理按钮', time: '', date: '', taskType: '', operator: false, taskId: 3 },
            // { content: '处理按钮：编辑，提醒，删除', time: '', date: '', taskType: '学习', operator: false, taskId: 4 },
            // { content: '点左下方按钮，分类查看事项', time: '', date: '', taskType: '工作', operator: false, taskId: 6 },
            // { content: '点右下方按钮，关于小程序', time: '', date: '', taskType: '生活', operator: false, taskId: 7 }
        ]
        let version = wx.getStorageSync('version')
        if (!version || version != 'v070302') {
            wx.setStorageSync('unfinishedList', welcomeUnfinishedList)
            wx.setStorageSync('finishedList', welcomeFinishedList)
            wx.setStorageSync('version', 'v070302')
        }
    },
    onShow: function () {
        this.globalData.unfinishedList = wx.getStorageSync('unfinishedList') || []
        this.globalData.finishedList = wx.getStorageSync('finishedList') || []
        // 更新
        let updateManager = wx.getUpdateManager()
        updateManager.onUpdateReady(function () {
            console.log('强制更新')
            updateManager.applyUpdate()
        })
    },
    onHide: function () {
        let unfinishedList = this.globalData.unfinishedList.map(task => {
            if (task.taskAnimation) {
                task.taskAnimation = null
            }
            if (task.XAnimation) {
                task.XAnimation = null
            }
            return task
        })
        let finishedList = this.globalData.finishedList.map(task => {
            if (task.taskAnimation) {
                task.taskAnimation = null
            }
            if (task.XAnimation) {
                task.XAnimation = null
            }
            return task
        })
        wx.setStorageSync( 'finishedList', finishedList )
        wx.setStorageSync( 'unfinishedList', unfinishedList )
    },
    globalData: {
        clientId: '17846f3496c8d7f6123b',
        userInfo: null,
        unfinishedList: [],
        finishedList: [],
        days: ['日', '一', '二', '三', '四', '五', '六'],
        timeTypes: [
            {content: '凌晨', start: 0, end: 5},
            {content: '早上好', start: 6, end: 9},
            {content: '中午好', start: 10, end: 14},
            {content: '下午好', start: 15, end: 18},
            {content: '晚上好', start: 19, end: 23}
        ]
    },
    // 时间加零
    dealTime: function (time, symb) {
        return time.split(symb).map(item => {
            if (item.length === 1) {
                item = '0' + item
            }
            return item
        }).join(symb)
    }
})