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

export type IResponse = Promise<{ response: AxiosResponse<any, any>, name: string }>;

export class RequestDefinitionHolder {
  requestPromises: {[key: string]: IResponse} = {};
  requests: IRequestDefinition[];
  responses: {[key: string]: any} = {};

  constructor (requests: IRequestDefinition[]) {
    this.requests = requests;
  }

  async get () {
    this.requests.forEach((request) => {
      // check for existsing request promise
      if (request.name in this.requestPromises) {
        return;
      }
  
      if (request.dependsOn) {
        const depPromises: IResponse[] = [];

        request.dependsOn.forEach((dep) => {
          console.log('creating dependant request for', request.name);

          // add the request promise if it doesn't exist yet
          if (!this.requestPromises[dep.name]) {
            this.requestPromises[dep.name] = this.createRequest(request);
          }

          depPromises.push(this.requestPromises[dep.name]);
        });

        this.requestPromises[request.name] = new Promise(async (resolve, reject) => {
          const responses = await Promise.all(depPromises);

          resolve(this.createRequest(request, this.formatResponses(responses)));
        });
      } else {
        this.requestPromises[request.name] = this.createRequest(request);
      }
    });

    const responses = await Promise.all(Object.values(this.requestPromises));

    return this.formatResponses(responses);
  }

  createRequest (request: IRequestDefinition, optionsData?: any) {
    console.log('createRequest', request.name);
    return axios.request(request.options(optionsData)).then((response) => {
      // possibly append request definition data here
      return {
        name: request.name,
        response
      }
    });
  }

  formatResponses (responses: { response: AxiosResponse<any, any>, name: string }[]) {
    // pull just the response data
    const response: {[k: string]: any} = {};
    responses.forEach((res) => {
      response[res.name] = res.response.data;
    });

    return response;
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
    console.log('chart data', data?.airport?.['KSDF']?.[0]?.icao_ident);
    return {
      url: 'https://api.aviationapi.com/v1/charts/afd',
      method: 'GET',
      params: {
        apt: data?.airport?.['KSDF']?.[0]?.icao_ident
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

export async function getData() {
  const holder = await new RequestDefinitionHolder([airportRequest, chartRequest, weatherRequest]).get();
  // console.log('holder', holder);

  return holder;
}