import { readFile, writeFile } from '../utils';
import type { EpsState } from './state';

export function getEpsPath(outputDir: string, filename?: string): string {
  return `${outputDir}/${filename || ''}`;
}

export async function getData(
  epsUrl: string,
  _reqUrl: string,
  outputDir: string,
  state: EpsState,
  cachedData?: any
) {
  if (cachedData && cachedData.list) {
    state.epsList = cachedData.list;
  } else {
    const localData = await readFile(getEpsPath(outputDir, 'eps.json'), true);

    if (localData) {
      if (Array.isArray(localData)) {
        state.epsList = localData;
      } else if (localData.data) {
        const entities: any[] = [];
        Object.entries(localData.data).forEach(([moduleKey, entitiesList]: [string, any]) => {
          if (Array.isArray(entitiesList)) {
            entitiesList.forEach((entity: any) => {
              entities.push({
                ...entity,
                moduleKey
              });
            });
          }
        });
        state.epsList = entities;
      } else {
        state.epsList = [];
      }
    } else {
      state.epsList = [];
    }

    if (!epsUrl) {
      return;
    }
  }

  state.epsList.forEach((e) => {
    if (!e.namespace) {
      e.namespace = e.prefix || '';
    }
    if (!e.api) e.api = [];
    if (!e.columns) e.columns = [];
    if (!e.pageColumns) e.pageColumns = [];
    if (!e.search) {
      e.search = {
        fieldEq: [],
        fieldLike: [],
        keyWordLikeFields: [],
      };
    }
  });
}

export async function createJson(outputDir: string, state: EpsState): Promise<boolean> {
  const content = JSON.stringify(state.epsList, null, '\t');
  const localContent = await readFile(getEpsPath(outputDir, 'eps.json'));

  const isUpdate = content !== localContent;

  if (isUpdate) {
    writeFile(getEpsPath(outputDir, 'eps.json'), content);
  }

  return isUpdate;
}
