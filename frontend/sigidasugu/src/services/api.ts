import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    console.log("token", token)
    if (token) {
      ;(config.headers as any) = (config.headers || {})
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  })