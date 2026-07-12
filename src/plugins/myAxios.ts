import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// 1. 后端通用响应结构
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  description?: string;
}

// 2. 自定义实例类型：拦截器已解包 response.data，方法直接返回 ApiResponse
interface UnwrappedAxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  defaults: AxiosInstance['defaults'];
  interceptors: AxiosInstance['interceptors'];
}

const isDev = process.env.NODE_ENV === 'development';

const instance = axios.create({
    baseURL: isDev ? 'http://localhost:8101/api' : '线上地址',
});

instance.defaults.withCredentials = true; // 配置为true

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    console.log('我要发请求啦', config)
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    console.log('我收到你的响应啦', response)
    // 未登录则跳转到登录页
    if (response?.data?.code === 40100) {
        const redirectUrl = window.location.href;
        window.location.href = `/user/login?redirect=${redirectUrl}`;
    }
    // Do something with response data
    return response.data;
}, function (error) {
    // Do something with response error
    return Promise.reject(error);
});

// 3. 断言为自定义类型
const myAxios = instance as unknown as UnwrappedAxiosInstance;

export default myAxios;
