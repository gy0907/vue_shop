import axios from 'axios'

function request(options){
  let instance = axios.create({
    baseURL: 'https://www.liulongbin.top:8888/api/private/v1',
    timeout: 5000,
    method: options.method || 'GET'
  })

  instance.interceptors.request.use(options=>{
    options.headers=""
    return options
  },err=>{
    console.log(err)
  })

  instance.interceptors.response.use(res=>{
    return res.data
  },err=>{
    console.log(err)
  })

  return instance(options)
}

export default request

