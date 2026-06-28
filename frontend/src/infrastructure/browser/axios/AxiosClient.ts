import { endpoint, zodParse, type PageableParams, type PageableResponse } from "@rgo/front-ui";
import axios, { type AxiosRequestConfig } from "axios";
import z from "zod";

export abstract class AxiosClient {
  private base: string;

  constructor(base: string) {
    this.base = base;
  }

  protected httpGet<TSchema extends z.ZodTypeAny = z.ZodUnknown>(schema?: TSchema) {
    return async (url: string, config?: AxiosRequestConfig): Promise<z.infer<TSchema>> => {
      const data = await this.doGet(url, config);
      return zodParse(schema ?? z.any(), data);
    };
  }

  protected httpGetPageable<TSchema extends z.ZodTypeAny = z.ZodUnknown>(schema?: TSchema) {
    return async (
      url: string,
      pageable: PageableParams,
      config?: AxiosRequestConfig,
    ): Promise<PageableResponse<z.infer<TSchema>>> => {
      const response = await this.doGetPageable(url, pageable, config);
      return {
        ...response,
        content: zodParse(z.array(schema ?? z.any()), response.content),
      };
    };
  }

  protected httpPost<TSchema extends z.ZodTypeAny = z.ZodUnknown>(schema?: TSchema) {
    return async (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<z.infer<TSchema>> => {
      const responseData = await this.doPost(url, data, config);
      return zodParse(schema ?? z.any(), responseData);
    };
  }

  protected httpPut<TSchema extends z.ZodTypeAny = z.ZodUnknown>(schema?: TSchema) {
    return async (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<z.infer<TSchema>> => {
      const responseData = await this.doPut(url, data, config);
      return zodParse(schema ?? z.any(), responseData);
    };
  }

  private async doGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.get<T>(endpoint(this.base, url), config);
    return response.data;
  }

  private async doGetPageable<T>(
    url: string,
    pageable: PageableParams,
    config?: AxiosRequestConfig,
  ): Promise<PageableResponse<T>> {
    const response = await axios.get<PageableResponse<T>>(endpoint(this.base, url), {
      ...config,
      params: {
        ...pageable,
        ...(config?.params || {}),
      },
    });
    return response.data;
  }

  private async doPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.post<T>(endpoint(this.base, url), data, config);
    return response.data;
  }

  private async doPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.put<T>(endpoint(this.base, url), data, config);
    return response.data;
  }
}
