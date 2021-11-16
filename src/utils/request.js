/* 封装axios请求模块 */
import axios from 'axios'
import store from '@/store'
import JSONBig from 'json-bigint'

const request = axios.create({
  // baseURL: 'http://api-toutiao-web.itheima.net' // 接口的基准路径
  baseURL: 'http://toutiao-app.itheima.net',

  // transformResponse 允许自定义原始的响应数据
  transformResponse: [function (data) {
    try {
      // 如果转换成功则返回转换的数据结果
      return JSONBig.parse(data)
    } catch (err) {
      // 其他数据的话，直接原样返回
      return data
    }
  }]
})

// 请求拦截器
request.interceptors.request.use(function (config) {
  if (config.url.startsWith('/app')) {
    config.url = config.url.slice(4)
  }
  const { user } = store.state
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
}, function (err) {
  return Promise.reject(err)
})

export default request
