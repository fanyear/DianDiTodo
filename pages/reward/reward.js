// pages/reward/reward.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      src: 'http://chuantu.biz/t6/328/1528988670x-1566688550.jpg'
  },
  previewImage: function(e) {
      wx.previewImage({
          urls: this.data.src.split(',') // 需要预览的图片http链接列表     
      })
  }
})