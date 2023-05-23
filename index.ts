import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { message as msg } from "ant-design-vue";
import { NSAxios } from "./Axios";
import type { CreateAxiosOptions, AxiosTransform } from "./axiosTransform";
import type { RequestOptions, Result } from "#/axios";
import { deepMerge, deepCopy } from "@/utils/index";

import { useLocaleOut } from "@/store/modules/locale";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useGo } from "@/hooks/web/usePage";
import { useRouter } from "vue-router";
// console.log('BASE_URL', import.meta.env.VITE_BASE_URL);
const baseURL: string = import.meta.env.VITE_BASE_URL;
const appStore = useAppStoreWithOut();
//三个钩子函数
const transform: AxiosTransform = {
  //处理成功响应数据和错误提示
  // res响应数据，options自定义选项
  transformResponseHook(res: AxiosResponse<Result>, options: RequestOptions) {
    const { isReturnNativeResponse, isTransformResponse } = options;
    appStore.setPageLoading(false); // 隐藏页面加载中的提示
    if (isReturnNativeResponse) {
      return res;
    }
    if (!isTransformResponse) {
      return res.data;
    }
    const { data } = res;

    if (!data) {
      console.log("出错");
    }

    const { code, message } = data; //后台接口统一字段格式code, result, status, message

    //逻辑处理,成功/错误提示
    if (code && code == 200) {
      //console.log(message || '成功'); //弹窗提示or...
      return { ...data };
    }
    let errormsg = message || "";
    //根据code执行不同操作
    switch (code) {
      case 401: // tocken 过期
        errormsg = "错误1";

        //useRouter().push({ name: 'login', params: {} });
        //goTo({ name: 'login' });
        break;
      case 2:
        errormsg = "错误2";
        break;
      default:
        if (message) {
          errormsg = message;
        }
        break;
    }
    msg.error(errormsg); //提示错误
  },
  transformResponseErroHook() {
    //用于处理失败响应数据的 catch
    // 捕获catch
    appStore.setPageLoading(false);
  },
  requestInterceptors(config: AxiosRequestConfig) {
    //设置请求拦截器
    const localStore = useLocaleOut();
    //调用 useLocaleOut() 函数获取用户的语言环境
    const token = "";
    if (localStore.getLocale) {
      (config as Record<string, any>).headers.language = localStore.getLocale;
    }
    if (token) {
      (config as Record<string, any>).headers.Authorization = token;
    }
    return config;
  },
};
//创建axios实例
function createAxios(options?: Partial<CreateAxiosOptions>) {
  appStore.setPageLoading(true);
  return new NSAxios(
    //合并配置
    deepMerge(
      {
        transform: deepCopy(transform),
        baseURL, //默认请求前缀,可考虑加入环境变量
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        //默认配置
        requestOptions: {
          isReturnNativeResponse: false, // 是否返回原生响应头，默认不返回
          isTransformResponse: true, // 是否需要对返回数据进行处理，默认需要
        },
      },
      options //自定义配置
    )
  );
}
//默认实例
export const RSASHttp = createAxios();
//深拷贝
export function deepCopy<T>(obj: T): T {
  // if (obj === null && typeof obj !== 'object') {
  //   return obj;
  // }
  const newObj: T = Array.isArray(obj) ? ([] as T) : ({} as T);
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      newObj[key] = deepCopy(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
//
export function isObject(val: any) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
//深度合并对象
export function deepMerge<T>(src: any = {}, target: any = {}): T {
  const res = deepCopy(src);
  for (const key in target) {
    res[key] = isObject(target[key])
      ? deepMerge(res[key], target[key])
      : target[key];
  }
  return res;
}
