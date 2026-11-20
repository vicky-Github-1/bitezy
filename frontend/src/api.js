import axios from 'axios'

const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8080/api'})
api.interceptors.request.use(config=>{
  const auth=JSON.parse(localStorage.getItem('bitezyAuth')||'null')
  if(auth?.token) config.headers.Authorization=`Bearer ${auth.token}`
  return config
})
api.interceptors.response.use(r=>r,e=>{
  if(e.response?.status===401) localStorage.removeItem('bitezyAuth')
  return Promise.reject(e)
})
export default api
