// pages/add/add.js
let util = require('../../utils/util.js')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        select: '',
        timeAnimation: {},
        content: '',
        typeList: [
            { content: '学习', select: '' },
            { content: '生活', select: '' },
            { content: '工作', select: '' },
            { content: '运动', select: '' }
        ],
        reminderSwitch: false,
        time: '',
        // date: '',
        // minDate: '',
        // maxDate: '',
        dealType: '',
        taskId: '',
        timeRange: [
            ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
            ["00", "10", "20", "30", "40", "50"]
        ],
        focus: false,
        timeSelect: [],
        dateList: [],
        selectDate: '',
        selectIndex: 0,
        contentValue: ''
    },
    onLoad: function (options) {
        // type 0 新增 1 修改 提醒
        console.log('options', options)
        this.setData({
            dealType: options.type
        })
        // 设置时间
        this.getTime()
        // 插入数据
        if (options.type === '1') {
            this.insertTask(options.taskId)
        }
        // 设置自动focus
        if (options.reminder != '1') {
            this.setData({
                focus: true
            })
        } 
        // 分类添加
        if (options.taskType) {
            let taskType = options.taskType
            this.setData({
                typeList: this.initTaskType(taskType)
            })
        }
    },
    inputHandle: function(e) {
        this.setData({
            contentValue: e.detail.value
        })
    },
    deleteContent: function () {
        this.setData({
            contentValue: '',
            content: ''
        })
    },
    // 设置时间
    getTime: function () {
        let addMin = 10 - new Date().getMinutes() % 10
        let time = new Date(new Date().getTime() + 1000 * 60 * addMin)

        let maxTime = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5)
        let clock = `${time.getHours()}:${time.getMinutes()}`
        let date = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
        // let maxDate = `${maxTime.getFullYear()}-${maxTime.getMonth() + 1}-${maxTime.getDate()}`
        // 设置时间初始值
        let range = this.data.timeRange
        let hour = this.dealTime(clock, ':').split(':')[0]
        let min = this.dealTime(clock, ':').split(':')[1]
        // 设置日期选择列表
        let maxDay = 5
        let dateList = []
        for (let i = 0; i < maxDay; i++) {
            let dateItem = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * i)
            let dateLabel
            switch (i) {
                case 0: 
                    dateLabel = `今天 星期${app.globalData.days[dateItem.getDay()]}`
                break
                case 1: 
                    dateLabel = `明天 星期${app.globalData.days[dateItem.getDay()]}`
                break
                default:
                    dateLabel = `${dateItem.getMonth() + 1}月${dateItem.getDate()}日 星期${app.globalData.days[dateItem.getDay()]}`

            }
            dateList[i] = {
                label: dateLabel,
                value: this.dealTime(`${dateItem.getFullYear()}-${dateItem.getMonth() + 1}-${dateItem.getDate()}`, '-')
            }
        }
        this.setData({
            time: this.dealTime(clock, ':'),
            // minDate: this.dealTime(date, '-'),
            // maxDate: this.dealTime(maxDate, '-'),
            // date: this.dealTime(date, '-'),
            timeSelect: [range[0].indexOf(hour), range[1].indexOf(min)],
            dateList: dateList,
            selectDate: this.dealTime(date, '-'),
            selectIndex: 0
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
    // 提交
    formSubmit: function (event) {
        let formID = event.detail.formId
        let data = event.detail.value
        let typeIndex = util.arraySearch(this.data.typeList, (item) => {
            return item.select == 'selected'
        })
        let task = {
            content: data.content,
            time: data.switch ? this.data.time : '',
            date: data.switch ? this.data.selectDate : '',
            shortDate: data.switch ? this.data.selectDate.slice(5) : '',
            taskType: typeIndex === -1 ? '' : this.data.typeList[typeIndex].content,
            operator: false,
            taskId: this.data.taskId ? this.data.taskId : new Date().getTime()
        }
        let valid = this.checkForm(task)
        if(valid) {
            this.data.dealType == '0' ? this.addTask(task, formID) : this.modifyTask(task, formID)
        }
    },
    // 校验
    checkForm: function (data) {
        let title = ''
        let result = true
        if (data.time) {
            let now = (new Date().getTime()) / 1000 / 60
            let select = new Date()
            let selectDate = data.date
            let selectTime= data.time
            select.setFullYear(selectDate.split('-')[0])
            select.setMonth(selectDate.split('-')[1] - 1, selectDate.split('-')[2])
            select.setHours(selectTime.split(':')[0])
            select.setMinutes(selectTime.split(':')[1])
            select = select.getTime() / 1000 / 60

            if (now >= select) {
                title = '提醒时间已经过啦，请重新选择提醒时间'
                result = false
            }
        }
        if (!data.content.trim()) {
            title = '请输入新待办事项名称'
            result = false
        }
        if (data.content.trim() && data.content.trim().length > 12) {
            title = '事项名称太长啦，请控制在12个字符以内'
            result = false
        }
        if (!result) {
            wx.showToast({
                title: title,
                icon: 'none',
                duration: 2500
            })
        }
        return result
    },
    addTask: function (task, formID) {
        if (task.time) {
            this.addTaskWithReminder(task, formID, (res) => {
                let id = res.data.id
                task.id = id
                // 新增任务
                app.globalData.unfinishedList.unshift(task)
            })
        } else {
            wx.navigateBack()
            // 新增任务
            app.globalData.unfinishedList.unshift(task)
        }
    },
    modifyTask: function (task, formID) {
        let index = util.arraySearch(app.globalData.unfinishedList, (item) => {
            return item.taskId == task.taskId
        })
        let localTask = app.globalData.unfinishedList[index]
        if (!localTask.id && !localTask.time) {
            if (!task.time) {
                console.log('无 -> 无')
                app.globalData.unfinishedList[index] = task
                wx.navigateBack()
            } else {
                console.log('无 -> 有')
                // 提交formID
                this.addTaskWithReminder(task, formID, (res) => {
                    let id = res.data.id
                    task.id = id
                    app.globalData.unfinishedList[index] = task
                    wx.navigateBack()
                })
            }
            return
        }

        if (localTask.id && localTask.time) {
            if (!task.time) {
                this.deleteReminder(localTask)
                task.id = ''
                app.globalData.unfinishedList[index] = task
                wx.navigateBack()
            } else {
                this.updateReminder(localTask.id, task, formID, (res) => {
                    let id = res.data.id
                    task.id = id
                    app.globalData.unfinishedList[index] = task
                    wx.navigateBack()
                })
            }
            return
        }
    },
    updateReminder: function (id, task, formID, callback) {
        // 提交formID
        wx.BaaS.wxReportTicket(formID)

        let tableID = '41164'
        let MyTableObject = new wx.BaaS.TableObject(tableID)
        let MyRecord = MyTableObject.getWithoutData(id)
        let chinaTime = this.transparentTime(task.time, task.date)
        MyRecord.set({
            formID: formID,
            content: task.content,
            time: chinaTime.chinaTime,
            date: chinaTime.chinaDate
        })
        let loadingData = {
            title: '拼命设置提醒中...',
            mask: true
        }
        wx.showLoading(loadingData)
        MyRecord.update().then(res => {
            wx.hideLoading()
            // success
            console.log('update success', res)
            callback(res)
        }, err => {
            // err
            console.log('update err', err)
            wx.hideLoading()
            this.addTaskWithReminder(task, formID, callback)
        })
    },
    deleteReminder: function (task) {
        let tableID = '41164'
        let MyTableObject = new wx.BaaS.TableObject(tableID)
        MyTableObject.delete(task.id).then(res => {
            // success
            console.log('delete success')
        }, err => {
            // err
            console.log('delete err')
        })
    },
    // 时间转换
    transparentTime(time, date) {
        let timeOffet = (new Date().getTimezoneOffset() + 480) * 60 * 1000

        let result = new Date()
        let selectDate = date
        let selectTime = time
        result.setFullYear(selectDate.split('-')[0])
        result.setMonth(selectDate.split('-')[1] - 1, selectDate.split('-')[2])
        result.setHours(selectTime.split(':')[0])
        result.setMinutes(selectTime.split(':')[1])
        let china = new Date(result.getTime() + timeOffet)
        let chinaDate = this.dealTime(`${china.getFullYear()}-${china.getMonth() + 1}-${china.getDate()}`, '-')
        let chinaTime = this.dealTime(`${china.getHours()}:${china.getMinutes()}`, ':')
        return { chinaTime, chinaDate}
    },
    addTaskWithReminder: function (task, formID, callback) {
        // 提交formID
        wx.BaaS.wxReportTicket(formID)
        // 新增数据
        let tableID = '41164'
        let reminderTable = new wx.BaaS.TableObject(tableID)
        let reminder = reminderTable.create()
        let chinaTime = this.transparentTime(task.time, task.date)
        let data = {
            openid: app.globalData.userInfo.openid,
            formID: formID,
            content: task.content,
            time: chinaTime.chinaTime,
            date: chinaTime.chinaDate
        }
        let loadingData = {
            title: '拼命设置提醒中...',
            mask: true
        }
        wx.showLoading(loadingData)
        reminder.set(data).save().then(res => {
            callback(res)
            // let id = res.data.id
            // task.id = id
            // // 新增任务
            // app.globalData.unfinishedList.unshift(task)
            wx.hideLoading()
            wx.navigateBack()
        }, err => {
            // err
            wx.hideLoading()
            wx.showToast({
                title: '服务器异常，请重新操作',
                icon: 'none',
                duration: 2500
            })
            console.log('add err')
        })
    },
    insertTask: function (taskId) {
        let selectIndex = util.arraySearch(app.globalData.unfinishedList, (item) => {
            return item.taskId == taskId
        })
        let task = app.globalData.unfinishedList[selectIndex]
        // 设置时间初始值
        let range = this.data.timeRange
        let hour = task.time ? task.time.split(':')[0] : ''
        let min = task.time ? task.time.split(':')[1] : ''

        let dateIndex = -1
        let dateList = this.data.dateList
        if(task.time){
            this.data.dateList.forEach((item, index) => {
                if (item.value == task.date) {
                    dateIndex = index
                }
            })
            if (dateIndex == -1) {
                dateList.unshift({
                    label: task.date,
                    value: task.date
                })
                dateIndex = 0
            }
        } 

        this.setData({
            content: task.content,
            contentValue: task.content,
            typeList: this.initTaskType(task.taskType),
            reminderSwitch: !!task.time,
            time: task.time ? task.time : this.data.time,
            // date: task.date ? task.date : this.data.date,
            selectDate: task.date ? task.date : this.data.selectDate,
            selectIndex: task.date ? dateIndex : 0,
            dateList: dateList,
            taskId: task.taskId,
            timeSelect: task.time ? [range[0].indexOf(hour), range[1].indexOf(min)] : this.data.timeSelect
        })
        !!task.time && this.showReminder(true)
    },
    initTaskType: function(taskType) {
        let list = this.data.typeList
        return list.map(item => {
            if (item.content == taskType) {
                item.select = "selected"
            }
            return item
        })
    },
    selectType: function (event) {
        let selectedIndex = util.arraySearch(this.data.typeList, (item) => {
            return item.select === 'selected'
        })
        let index = event.currentTarget.dataset.index
        let array = this.data.typeList
        if (selectedIndex === -1) {
            array[index].select = 'selected'
        } else if (selectedIndex === index) {
            array[index].select = ''
        } else {
            array[selectedIndex].select = ''
            array[index].select = 'selected'
        }
        this.setData({
            typeList: array,
        })
    },
    // bindDateChange: function (e) {
    //     this.setData({
    //         date: e.detail.value
    //     })
    // },
    bindSelectDateChange: function (e) {
        let dateList = this.data.dateList
        let index = e.detail.value
        this.setData({
            selectDate: dateList[index].value,
            selectIndex: index
        })
    },
    bindTimeChange: function (e) {
        let arr = e.detail.value
        let hour = arr[0]
        let min = arr[1]
        let result = this.data.timeRange
        this.setData({
            time: `${result[0][hour]}:${result[1][min]}`
        })
    },
    showReminder: function (flag) {
        let animation = wx.createAnimation({
            duration: 100,
            timingFunction: 'ease'
        })
        let height = flag ? '330rpx' : '0rpx'
        this.setData({
            timeAnimation: animation.height(height).step()
        })
    },
    switchChange: function (e) {
        let result = e.detail.value
        this.showReminder(result)
    },
    onShareAppMessage: function (ops) {
        return {
            title: ' ',
            path: 'pages/index/index',
            imageUrl: '/assets/img/share.png'
        }
    }
})