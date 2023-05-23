import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { RequestOptions, Result } from '#/axios';
export interface CreateAxiosOptions extends AxiosRequestConfig {
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}
//数据处理
export class AxiosTransform {
  //请求前配置
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  //处理响应数据
  transformResponseHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;

  //捕获respons error catch
  transformResponseErroHook?: (e: AxiosError) => any;
  //请求拦截器
  requestInterceptors?: (
    config: AxiosRequestConfig,
    options: CreateAxiosOptions
  ) => AxiosRequestConfig;
}
