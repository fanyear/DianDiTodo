// pages/index/task/task.js
let util = require('../../../utils/util.js')
const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        update: {
            type: Number,
            observer: function(newVal, oldVal) {
                if (oldVal != 0) {
                    console.log('更新数据')
                    this.refreshDataFromApp()
                }
                this.getLocalTime()
            }
        },
        taskType: {
            type: String
        }
    },

    ready: function() {
        // 更新数据
        this.refreshDataFromApp()
    },

    /**
     * 组件的初始数据
     */
    data: {
        unfinishedList: [],
        finishedList: [],
        orgHeight: '112rpx',
        aniHeight: '208rpx',
        dateObj: {},
        left: 0,
        moveStart: 0,
        status: false,
        finishedMax: 5,
        addFinish: 10
    },

    /**
     * 组件的方法列表
     */
    methods: {
        toggleX: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.returnTask(taskId)
            this.getTaskformList(taskId, done, (list, index) => {
                let open = !list[index].XAnimation.open
                list[index].XAnimation.open = open
                if (done) {
                    this.setData({
                        finishedList: list
                    })
                } else {
                    this.setData({
                        unfinishedList: list
                    })
                }
                this.moveTaskX(index, done)
            })
        },
        addMoreFinished: function() {
            this.setData({
                finishedMax: this.data.finishedMax + this.data.addFinish
            })
        },
        touchstart: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.returnTask(taskId)
            this.getTaskformList(taskId, done, (list, index) => {
                list[index].XAnimation.XRelative = event.changedTouches[0].pageX
                if (done) {
                    this.setData({
                        finishedList: list
                    })
                } else {
                    this.setData({
                        unfinishedList: list
                    })
                }
            })
        },
        touchmove: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.getTaskformList(taskId, done, (list, index) => {
                let relative = list[index].XAnimation.XRelative
                let XPos = list[index].XAnimation.XPos
                let XStart = list[index].XAnimation.XStart
                list[index].XAnimation.XPos = XStart + 2 * (event.changedTouches[0].pageX - relative)
                if (done) {
                    this.setData({
                        finishedList: list
                    })
                } else {
                    this.setData({
                        unfinishedList: list
                    })
                }
            })
        },
        touchend: function(event) {
            // 动画
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.getTaskformList(taskId, done, (list, index) => {
                list[index].XAnimation.XStart = list[index].XAnimation.XPos
                if (done) {
                    this.setData({
                        finishedList: list
                    })
                } else {
                    this.setData({
                        unfinishedList: list
                    })
                }
            })
            this.getTaskformList(taskId, done, (list, index) => {
                let open = list[index].XAnimation.open
                let status = this.data.status
                this.moveTaskX(list, index, done, !open, status)
            })
        },
        returnTask: function(taskId) {
            let status = this.data.status
            // let status = !this.data.status
            // this.setData({
            //     status: status
            // })
            let unfinishedList = this.data.unfinishedList
            let finishedList = this.data.finishedList
            let unfinishedListIndex = util.arraySearch(this.data.unfinishedList, (item) => {
                return item.XAnimation.open && item.taskId != taskId
            })
            if (unfinishedListIndex != -1) {
                unfinishedList[unfinishedListIndex].XAnimation.open = false
                this.setData({
                    unfinishedList: unfinishedList
                })
                this.moveTaskX(unfinishedListIndex, false)
            }
            let finishedListIndex = util.arraySearch(this.data.finishedList, (item) => {
                return item.XAnimation.open && item.taskId != taskId
            })
            if (finishedListIndex != -1) {
                finishedList[finishedListIndex].XAnimation.open = false
                this.setData({
                    finishedList: finishedList
                })
                this.moveTaskX(finishedListIndex, true)
            }
        },
        moveTaskX: function(index, done) {
            let list = done ? this.data.finishedList : this.data.unfinishedList
            let pos = list[index].XAnimation.XPos
            let open = list[index].XAnimation.open
            let openSize = -254
            let targetSize = open ? openSize : 0
            let large = pos < targetSize

            // list[index].XAnimation.XPos = targetSize
            // list[index].XAnimation.XStart = targetSize
            // list[index].XAnimation.open = open

            if (pos != targetSize) {
                if (Math.abs(pos - targetSize) < 30) {
                    list[index].XAnimation.XPos = targetSize
                    list[index].XAnimation.XStart = targetSize
                } else {
                    if (large) {
                        list[index].XAnimation.XPos = pos + 30
                    } else {
                        list[index].XAnimation.XPos = pos - 30
                    }
                }
                setTimeout(() => {
                    this.moveTaskX(index, done)
                }, 10)
            } else {
                list[index].XAnimation.XStart = targetSize
            }
            if (done) {
                this.setData({
                    finishedList: list
                })
            } else {
                this.setData({
                    unfinishedList: list
                })
            }
        },
        animationiteration: function(e) {
        },
        getTaskformList: function(taskId, done, callback) {
            let index = util.arraySearch(done ? this.data.finishedList : this.data.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            let newList = done ? this.data.finishedList : this.data.unfinishedList
            callback(newList, index)
        },
        // 从全局获取数据
        refreshDataFromApp: function() {
            let taskType = this.data.taskType
            this.setData({
                unfinishedList: app.globalData.unfinishedList.concat().map(task => {
                    task.XAnimation = {
                        XRelative: 0,
                        XPos: 0,
                        XStart: 0,
                        open: false
                    }
                    return task
                }).filter((ele) => {
                    if (taskType) {
                        return ele.taskType === taskType
                    } else {
                        return true
                    }
                }),
                finishedList: app.globalData.finishedList.concat().map(task => {
                    task.XAnimation = {
                        XRelative: 0,
                        XPos: 0,
                        XStart: 0,
                        open: false
                    }
                    return task
                }).filter((ele) => {
                    if (taskType) {
                        return ele.taskType === taskType
                    } else {
                        return true
                    }
                }),
                finishedMax: 5
            })
        },
        // 获取时间
        getLocalTime: function() {
            // 设置日期选择列表
            let today = new Date()
            let tomorrow = new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
            let yesterday = new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
            let todayLabel = app.dealTime(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`, '-')
            let tomorrowLabel = app.dealTime(`${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`, '-')
            let yesterdayLabel = app.dealTime(`${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`, '-')
            let data = {}
            data[todayLabel] = '今天'
            data[tomorrowLabel] = '明天'
            data[yesterdayLabel] = '昨天'
            this.setData({
                dateObj: data
            })
        },
        // 任务点击处理函数
        tapTask: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.showTaskOperator(taskId, done)
        },
        // 任务处理栏显示控制
        showTaskOperator: function(taskId, done) {
            let selectIndex = util.arraySearch(done ? this.data.finishedList : this.data.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            let showedIndex = util.arraySearch(done ? this.data.finishedList : this.data.unfinishedList, (item) => {
                return item.operator
            })
            if (selectIndex === showedIndex) {
                this.dealOperator(selectIndex, done, false)
            } else if (showedIndex === -1) {
                this.dealOperator(selectIndex, done, true)
            } else {
                this.dealOperator(showedIndex, done, false)
                this.dealOperator(selectIndex, done, true)
            }
            this.hideAllOperator(!done)
        },
        hideAllOperator: function(done) {
            let animation = wx.createAnimation({
                duration: 200,
                timingFunction: 'ease'
            })
            animation.height(this.data.orgHeight).step()
            let newList = done ? this.data.finishedList : this.data.unfinishedList
            newList.forEach(task => {
                if (task.operator) {
                    task.operator = false
                    task.taskAnimation = animation.export()
                }
            })
            if (done) {
                this.setData({
                    finishedList: newList
                })
            } else {
                this.setData({
                    unfinishedList: newList
                })
            }
        },
        // 单个任务的处理栏显示控制
        dealOperator: function(index, done, show) {
            let animation = wx.createAnimation({
                duration: 200,
                timingFunction: 'ease'
            })
            let newList = done ? this.data.finishedList : this.data.unfinishedList
            if (show) {
                animation.height(this.data.aniHeight).step()
            } else {
                animation.height(this.data.orgHeight).step()
            }
            newList[index].operator = show
            newList[index].taskAnimation = animation.export()
            if (done) {
                this.setData({
                    finishedList: newList
                })
            } else {
                this.setData({
                    unfinishedList: newList
                })
            }
        },
        deleteTask: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            this.hideTask(done, taskId)
            this.removeTaskFromData(done, taskId)
        },
        // 删除未完成事项
        deleteUnfinishedTask: function (event) {
            let taskId = event.currentTarget.dataset.taskId
            let done = event.currentTarget.dataset.done
            let that = this
            wx.showModal({
                title: '提示',
                content: '是否删除此事项',
                confirmColor: '#65c0ba',
                confirmText: "删除",
                cancelColor: "#C5C3C2",
                success: function (res) {
                    if (res.confirm) {
                        that.hideTask(done, taskId)
                        that.removeTaskFromData(done, taskId)
                    }
                }
            })
        },
        finishTask: function(event) {
            this.returnTask('all')
            wx.vibrateShort()
            let taskId = event.currentTarget.dataset.taskId

            let unfinishedList = this.data.unfinishedList
            let finishedList = this.data.finishedList
            let index = util.arraySearch(unfinishedList, (item) => {
                return item.taskId === taskId
            })

            let task = Object.assign({}, unfinishedList[index])
            delete task.taskAnimation

            unfinishedList.splice(index, 1)
            finishedList.unshift(task)
            this.setData({
                unfinishedList: unfinishedList,
                finishedList: finishedList
            })
            // globalData
            let globalIndex = util.arraySearch(app.globalData.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            app.globalData.unfinishedList.splice(globalIndex, 1)
            app.globalData.finishedList.unshift(task)
        },
        unfinishTask: function(event) {
            this.returnTask('all')
            wx.vibrateShort()
            let taskId = event.currentTarget.dataset.taskId
            let unfinishedList = this.data.unfinishedList
            let finishedList = this.data.finishedList
            let index = util.arraySearch(finishedList, (item) => {
                return item.taskId === taskId
            })

            let task = Object.assign({}, finishedList[index])
            delete task.taskAnimation
            unfinishedList.unshift(task)
            finishedList.splice(index, 1)
            this.setData({
                unfinishedList: unfinishedList,
                finishedList: finishedList
            })
            // globalData
            let globalIndex = util.arraySearch(app.globalData.finishedList, (item) => {
                return item.taskId === taskId
            })
            app.globalData.finishedList.splice(globalIndex, 1)
            app.globalData.unfinishedList.unshift(task)
        },
        // 隐藏任务
        hideTask: function(done, taskId) {
            let selectIndex = util.arraySearch(done ? this.data.finishedList : this.data.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            let animation = wx.createAnimation({
                duration: 200,
                timingFunction: 'ease'
            })
            let newList = done ? this.data.finishedList : this.data.unfinishedList
            animation.height('0rpx').step()
            newList[selectIndex].taskAnimation = animation.export()
            newList[selectIndex].operator = false
            if (done) {
                this.setData({
                    finishedList: newList
                })
            } else {
                this.setData({
                    unfinishedList: newList
                })
            }
        },
        removeTaskFromData: function(done, taskId) {
            setTimeout(() => {
                let selectIndex = util.arraySearch(done ? this.data.finishedList : this.data.unfinishedList, (item) => {
                    return item.taskId === taskId
                })
                let newList = done ? this.data.finishedList : this.data.unfinishedList
                let task = done ? this.data.finishedList[selectIndex] : this.data.unfinishedList[selectIndex]
                // 比较时间
                if (task.id && task.time) {
                    let now = (new Date().getTime()) / 1000 / 60
                    let select = new Date()
                    let selectDate = task.date
                    let selectTime = task.time
                    select.setFullYear(selectDate.split('-')[0])
                    select.setMonth(selectDate.split('-')[1] - 1, selectDate.split('-')[2])
                    select.setHours(selectTime.split(':')[0])
                    select.setMinutes(selectTime.split(':')[1])
                    select = select.getTime() / 1000 / 60

                    if (now < select) {
                        // 删除数据库
                        let tableID = '41164'
                        let MyTableObject = new wx.BaaS.TableObject(tableID)
                        MyTableObject.delete(task.id).then(res => {
                            // success
                            console.log('delete success')
                        }, err => {
                            // err
                            console.log('delete err')
                        })
                    }
                }
                newList.splice(selectIndex, 1)
                if (done) {
                    this.setData({
                        finishedList: newList
                    })
                } else {
                    this.setData({
                        unfinishedList: newList
                    })
                }
                // globalData
                if (done) {
                    let Index = util.arraySearch(app.globalData.finishedList, (item) => {
                        return item.taskId === taskId
                    })
                    app.globalData.finishedList.splice(Index, 1)
                } else {
                    let Index = util.arraySearch(app.globalData.unfinishedList, (item) => {
                        return item.taskId === taskId
                    })
                    app.globalData.unfinishedList.splice(Index, 1)
                }
            }, 300)
        },
        editTask: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let Index = util.arraySearch(this.data.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            this.dealOperator(Index, false, false)
            wx.navigateTo({
                url: '../add/add?type=1&taskId=' + taskId
            })
            this.returnTask('all')
        },
        reminderTask: function(event) {
            let taskId = event.currentTarget.dataset.taskId
            let Index = util.arraySearch(this.data.unfinishedList, (item) => {
                return item.taskId === taskId
            })
            this.dealOperator(Index, false, false)
            wx.navigateTo({
                url: '../add/add?type=1&taskId=' + taskId + '&reminder=1'
            })
        },
        // 确定清空已完成事项
        confirmClearFinishedData: function() {
            let that = this
            let taskType = this.data.taskType
            wx.showModal({
                title: '提示',
                content: taskType ? `是否清空${taskType}类已完成事项` : '是否清空所有已完成事项',
                confirmColor: '#65c0ba',
                confirmText: "清空",
                cancelColor: "#C5C3C2",
                success: function(res) {
                    if (res.confirm) {
                        that.clearFinishedTask()
                        wx.showToast({
                            title: '清空成功',
                            icon: 'success',
                            duration: 2000
                        })
                    }
                }
            })
        },
        clearFinishedTask: function() {
            let taskType = this.data.taskType
            let taskList = app.globalData.finishedList.filter((ele) => {
                if (taskType) {
                    return ele.taskType === taskType
                } else {
                    return true
                }
            })
            taskList.forEach(item => {
                // 比较时间
                if (item.id && item.time) {
                    let now = (new Date().getTime()) / 1000 / 60
                    let select = new Date()
                    let selectDate = item.date
                    let selectTime = item.time
                    select.setFullYear(selectDate.split('-')[0])
                    select.setMonth(selectDate.split('-')[1] - 1, selectDate.split('-')[2])
                    select.setHours(selectTime.split(':')[0])
                    select.setMinutes(selectTime.split(':')[1])
                    select = select.getTime() / 1000 / 60

                    if (now < select) {
                        // 删除数据库
                        let tableID = '41164'
                        let MyTableObject = new wx.BaaS.TableObject(tableID)
                        MyTableObject.delete(item.id)
                    }
                }
            })
            app.globalData.finishedList = !taskType ? [] : app.globalData.finishedList.filter((ele) => ele.taskType != taskType)
            this.refreshDataFromApp()
        },
    }
})