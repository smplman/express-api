import axios from 'axios';
import type { Method, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestConfig extends AxiosRequestConfig {
  host?: string
  path?: string
  method: Method
  // params?: {[key: string]: string|number}
  // headers?: {[key: string]: string|number}
}

export interface IRequestDefinition {
  name: string
  dependsOn?: IRequestDefinition[]
  options: (data?: any) => RequestConfig
}

// export class RequestDefinition {
//   options: IRequestDefinition;
//   constructor (options: IRequestDefinition) {
//     this.options = options;
//   }

//   getOptions () {
//     return {
//       ...this.options,
//       url: this.getUrl()
//     }
//   }

//   getUrl () {
//     this.options.options().url || `${this.options?.host}${this.options?.path}`;
//   }
// }

export interface IRequestDefinitionHolder {

}

export class RequestDefinitionHolder {
  requestPromises: {[key: string]: Promise<AxiosResponse<any>>} = {};
  requests: IRequestDefinition[]

  constructor (requests: IRequestDefinition[]) {
    this.requests = requests;
  }

  get () {
    this.requests.forEach((request) => {
      if (request.dependsOn) {
        request.dependsOn.forEach((dep) => {
          console.log('creating dependant request for', request.name);
          this.requestPromises[request.name] = new Promise(async (resolve, reject) => {
            const data = await this.requestPromises[dep.name];
            const requstPromise = this.createRequest(request, data.data);

            resolve(requstPromise);
          });
        });
      } else {
        this.requestPromises[request.name] = this.createRequest(request);
      }
    });

    return Object.values(this.requestPromises);
  }

  createRequest (request: IRequestDefinition, optionsData?: any) {
    console.log('createRequest', request.name);
    return axios.request(request.options(optionsData)).then((response) => {
      // possibly append request definition data here
      return response;
    });
  }
}

const airportRequest: IRequestDefinition = {
  name: 'airport',
  options: () => {
    return {
      host: 'https://api.aviationapi.com',
      path: '/v1/airports',
      url: 'https://api.aviationapi.com/v1/airports',
      method: 'GET',
      params: {
        apt: 'ksdf'
      }
    }
  }
}

const chartRequest: IRequestDefinition = {
  name: 'chart',
  dependsOn: [airportRequest],
  options: (data: any) => {
    console.log(data?.['KSDF']?.[0]?.icao_ident);
    return {
      url: 'https://api.aviationapi.com/v1/charts/afd',
      method: 'GET',
      params: {
        apt: data?.['KSDF']?.[0]?.icao_ident
        // apt: 'ksdf'
      }
    }
  }
}

const weatherRequest: IRequestDefinition = {
  name: 'weather',
  // dependsOn: [airportRequest],
  options: (data: any) => {
    // console.log(data?.['KSDF']?.[0]?.icao_ident);
    return {
      url: 'https://api.aviationapi.com/v1/weather/metar',
      method: 'GET',
      params: {
        // apt: data?.['KSDF']?.[0]?.icao_ident
        apt: 'ksdf'
      }
    }
  }
}

axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request.url, null, 2))
  return request
})

export function getData() {
  const holder = new RequestDefinitionHolder([airportRequest, chartRequest, weatherRequest]).get();
  console.log('holder', holder);

  return holder;
}