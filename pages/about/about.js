// pages/about/about.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  reward: function () {
      wx.navigateTo({
          url: '../reward/reward',
      })
  },
  onShareAppMessage: function(ops) {
      return {
          title: ' ',
          path: 'pages/index/index',
          imageUrl: '/assets/img/share.png'
      }
  }
})