/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface SerializerMessage {
  message?: string;
}

export interface SerializerMotorModeCard {
  consumption_wh_per_km?: number;
  created_by_current_rider?: number;
  id?: number;
  image_url?: string;
  like_count?: number;
  mode_name?: string;
  support_percent?: number;
}

export interface SerializerMotorModeDeleteResponse {
  id?: number;
  status?: string;
}

export interface SerializerMotorModeDetail {
  consumption_wh_per_km?: number;
  created_at?: string;
  created_by_current_rider?: number;
  creator_rider_id?: number;
  id?: number;
  image_url?: string;
  like_count?: number;
  liked_by_current_rider?: number;
  mode_name?: string;
  published_at?: string;
  range_km?: number;
  short_description?: string;
  status?: string;
  support_percent?: number;
  video_url?: string;
}

export interface SerializerMotorModeLikeRequest {
  like: 0 | 1;
}

export interface SerializerMotorModeLikeResponse {
  like_count?: number;
  liked_by_current_rider?: number;
  motor_mode_id?: number;
}

export interface SerializerMotorModeList {
  consumption_max?: number;
  consumption_min?: number;
  max_consumption_wh_per_km?: number;
  motor_modes?: SerializerMotorModeCard[];
}

export interface SerializerMotorModePublishRequest {
  consumption_wh_per_km?: number;
  mode_name?: string;
  short_description?: string;
  support_percent?: number;
}

export interface SerializerRider {
  id?: number;
  is_bike_service_engineer?: boolean;
  login?: string;
}

export interface SerializerRiderCredentialsRequest {
  login: string;
  password: string;
}

export interface SerializerRiderLoginResponse {
  access_token?: string;
  expires_in?: number;
  rider?: SerializerRider;
  token_type?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Режимы работы мотора электровелосипеда
 * @version 1.0
 * @baseUrl /api
 * @contact
 *
 * Веб-сервис заявочной системы «Оценка времени разряда аккумулятора электровелосипеда». Чтение списка и ленты режимов доступно гостю, методы создателя режимов — авторизованному велосипедисту.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  motorModes = {
    /**
     * @description Доступен гостю. Фильтр по расходу батареи выполняется в БД. Признак created_by_current_rider равен 1 только у режимов авторизованного велосипедиста, у гостя всегда 0.
     *
     * @tags motor_modes
     * @name MotorModesList
     * @summary Список опубликованных режимов работы мотора
     * @request GET:/motor_modes
     */
    motorModesList: (
      query?: {
        /** Наибольший расход батареи, Вт·ч/км: больше 0 и меньше 1000 */
        max_consumption_wh_per_km?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerMotorModeList, SerializerMessage>({
        path: `/motor_modes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. Создаёт черновик, создатель заполняется из JWT. Файлы сохраняются в Minio под латинскими именами вида motor_mode_15.jpg и motor_mode_15.mp4.
     *
     * @tags motor_modes
     * @name MotorModesCreate
     * @summary Добавить режим работы мотора с фото и видео
     * @request POST:/motor_modes
     * @secure
     */
    motorModesCreate: (
      data: {
        /** Название режима, до 50 символов */
        mode_name: string;
        /**
         * Фото режима: JPEG, PNG или WebP до 10 МБ
         * @format binary
         */
        image: File;
        /**
         * Короткое видео режима: MP4 до 50 МБ
         * @format binary
         */
        video: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerMotorModeDetail, SerializerMessage>({
        path: `/motor_modes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. Идентификатор не указывается: владелец черновика берётся из JWT.
     *
     * @tags motor_modes
     * @name DraftList
     * @summary Черновик режима текущего велосипедиста
     * @request GET:/motor_modes/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<SerializerMotorModeDetail, SerializerMessage>({
        path: `/motor_modes/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Доступен гостю. Признак liked_by_current_rider равен 1, если авторизованный велосипедист поставил лайк этому режиму.
     *
     * @tags motor_modes
     * @name FeedList
     * @summary Лента: первый опубликованный режим
     * @request GET:/motor_modes/feed
     */
    feedList: (params: RequestParams = {}) =>
      this.request<SerializerMotorModeDetail, SerializerMessage>({
        path: `/motor_modes/feed`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Доступен гостю. С параметром next=true возвращает следующий опубликованный режим после указанного, после последнего снова первый.
     *
     * @tags motor_modes
     * @name FeedDetail
     * @summary Лента: режим по идентификатору или следующий за ним
     * @request GET:/motor_modes/feed/{motor_mode_id}
     */
    feedDetail: (
      motorModeId: number,
      query?: {
        /** true — вернуть следующий опубликованный режим */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<SerializerMotorModeDetail, SerializerMessage>({
        path: `/motor_modes/feed/${motorModeId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. Мягкое удаление: статус меняется на deleted, строка остаётся в БД.
     *
     * @tags motor_modes
     * @name MotorModesDelete
     * @summary Удалить свой режим работы мотора
     * @request DELETE:/motor_modes/{motor_mode_id}
     * @secure
     */
    motorModesDelete: (motorModeId: number, params: RequestParams = {}) =>
      this.request<SerializerMotorModeDeleteResponse, SerializerMessage>({
        path: `/motor_modes/${motorModeId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. like=1 ставит лайк от велосипедиста из JWT, like=0 снимает.
     *
     * @tags motor_modes
     * @name LikeCreate
     * @summary Поставить или снять лайк режиму
     * @request POST:/motor_modes/{motor_mode_id}/like
     * @secure
     */
    likeCreate: (
      motorModeId: number,
      like: SerializerMotorModeLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerMotorModeLikeResponse, SerializerMessage>({
        path: `/motor_modes/${motorModeId}/like`,
        method: "POST",
        body: like,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. Меняет статус draft на published, дату публикации ставит сервер.
     *
     * @tags motor_modes
     * @name PublishUpdate
     * @summary Опубликовать свой черновик режима
     * @request PUT:/motor_modes/{motor_mode_id}/publish
     * @secure
     */
    publishUpdate: (
      motorModeId: number,
      motor_mode: SerializerMotorModePublishRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerMotorModeDetail, SerializerMessage>({
        path: `/motor_modes/${motorModeId}/publish`,
        method: "PUT",
        body: motor_mode,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  riders = {
    /**
     * @description Доступна гостю. Проверяет пароль и выдаёт JWT. Значение access_token передаётся в остальных запросах заголовком Authorization после слова Bearer.
     *
     * @tags riders
     * @name LoginCreate
     * @summary Аутентификация велосипедиста
     * @request POST:/riders/login
     */
    loginCreate: (
      credentials: SerializerRiderCredentialsRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerRiderLoginResponse, SerializerMessage>({
        path: `/riders/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Только для авторизованного велосипедиста. JWT записывается в чёрный список Redis до истечения срока действия.
     *
     * @tags riders
     * @name LogoutCreate
     * @summary Деавторизация велосипедиста
     * @request POST:/riders/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<SerializerMessage, SerializerMessage>({
        path: `/riders/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Доступна гостю. Пароль хранится bcrypt-хешем.
     *
     * @tags riders
     * @name RegisterCreate
     * @summary Регистрация велосипедиста
     * @request POST:/riders/register
     */
    registerCreate: (
      credentials: SerializerRiderCredentialsRequest,
      params: RequestParams = {},
    ) =>
      this.request<SerializerRider, SerializerMessage>({
        path: `/riders/register`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
