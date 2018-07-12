// pages/type/type.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      taskType: '',
      update: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          taskType: options.taskType
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.setData({
          update: ++this.data.update
      })
  },
  add: function () {
      wx.navigateTo({
          url: '../add/add?type=0&taskType=' + this.data.taskType,
      })
  },
  about: function () {
      wx.navigateTo({
          url: '../about/about',
      })
  },
  onShareAppMessage: function (ops) {
      return {
          title: ' ',
          path: 'pages/index/index',
          imageUrl: '/assets/img/share.png'
      }
  },
  selctType: function () {
      let list = ['学习', '生活', '工作', '运动']
      wx.showActionSheet({
          itemList: list,
          itemColor: '#65c0ba',
          success: function (res) {
              wx.redirectTo({
                  url: '../type/type?taskType=' + list[res.tapIndex],
              })
          },
          fail: function (res) {
              console.log(res.errMsg)
          }
      })

  }
})