import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { RequestOptions, Result } from '#/axios';
import axios from 'axios';
import { deepCopy } from '@/utils';
import type { CreateAxiosOptions } from './axiosTransform';
const setToken = (url = ''): string => {
  const token = '';
  return token ? (url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`) : url;
};
export class NSAxios {
  private axiosInstance: AxiosInstance;
  private options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  setupInterceptors() {
    const { transform } = this.options; //请求处理配置
    const { requestInterceptors } = transform || {};
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      if (requestInterceptors) {
        config = requestInterceptors(config, this.options);
      }
      return config;
    });
  }

  get<T>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const url: string = setToken(config.url!);
    return this.request({ ...config, method: 'GET', url }, options || {});
  }

  post<T>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const url: string = setToken(config.url!);
    return this.request({ ...config, method: 'POST', url }, options || {});
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const url: string = setToken(config.url!);
    return this.request({ ...config, method: 'PUT', url }, options || {});
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const url: string = setToken(config.url!);
    return this.request({ ...config, method: 'DELETE', url }, options || {});
  }

  request<T>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const conf: CreateAxiosOptions = deepCopy(config);
    const { requestOptions } = this.options; //初始化默认配置
    const { transform } = this.options; //请求处理配置
    const { transformResponseHook, transformResponseErroHook } = transform || {};
    const opt: RequestOptions = Object.assign({}, requestOptions, options); //合并配置
    conf.requestOptions = opt;
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          if (transformResponseHook) {
            try {
              const result = transformResponseHook(res, opt);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: AxiosError) => {
          if (transformResponseErroHook) {
            try {
              const result = transformResponseErroHook(e);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          }
          console.log(e);
          reject(e);
        });
    });
  }
}
