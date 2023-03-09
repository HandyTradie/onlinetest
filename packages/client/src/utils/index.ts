export const uniqueBy = <T>(uniqueKey: keyof T, objects: T[]): T[] => {
  const ids = objects.map((object) => object[uniqueKey]);
  return objects.filter((object, index) => !ids.includes(object[uniqueKey], index + 1));
};

export const asyncUniqueBy = <T>(uniqueKey: keyof T, objects: T[]): Promise<T[]> =>
  new Promise((resolve) => {
    const ids = objects.map((object) => object[uniqueKey]);
    const ret = objects.filter((object, index) => !ids.includes(object[uniqueKey], index + 1));
    resolve(ret);
  });

export const obfuscate = (str: string, key: number, encrypt = true) =>
  encrypt
    ? [...(JSON.stringify(str) as unknown as string[])]
        .map((x) => String.fromCharCode(x.charCodeAt(0) + (key as number)))
        .join('')
    : JSON.parse(
        [...str].map((x) => String.fromCharCode(x.charCodeAt(0) - (key as number))).join('')
      );

export type Obfuscated<T> = {
  [P in keyof T]: T[P] extends string ? string : T[P];
};

export const shuffleArray = <T>(_array: T[]) => {
  const array = [..._array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getStandardDeviation = (array: number[]) => {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
};
