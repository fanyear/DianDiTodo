const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 数组查找元素并返回索引
const arraySearch = (array, callback) => {
  for (let i = 0; i < array.length; i++) {
      if (callback(array[i])) {
          return i
          break
      }
  }
  return -1
}

module.exports = {
  formatTime: formatTime,
  arraySearch: arraySearch
}
