import axios from 'axios';
import * as _ from 'lodash-es';
import { error } from '../utils';

export function getEpsUrl(epsUrl: string): string {
  return epsUrl || '/api/login/eps/contract';
}

export async function fetchEpsData(epsUrl: string, reqUrl: string) {
  let finalUrl: string;

  if (!reqUrl || reqUrl.startsWith('/')) {
    finalUrl = getEpsUrl(epsUrl);
  } else {
    finalUrl = reqUrl + getEpsUrl(epsUrl);
  }

  try {
    const response = await (axios as any).get(finalUrl, {
      timeout: 5000
    });

    const { code, data, message } = response.data;

    if (code === 1000) {
      if (!_.isEmpty(data)) {
        const entities: any[] = [];
        Object.entries(data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey
              });
            });
          }
        });
        return entities;
      }
    } else {
      error(`${message || 'Failed to fetch data'}`);
    }
  } catch (err) {
    error(`API service is not running → ${finalUrl}`);
  }

  return [];
}
