export const obfuscate = (str: string, key: number, encrypt = true) =>
  encrypt
    ? [...(JSON.stringify(str) as unknown as string[])]
        .map((x) => String.fromCharCode(x.charCodeAt(0) + (key as number)))
        .join('')
    : JSON.parse(
        [...str].map((x) => String.fromCharCode(x.charCodeAt(0) - (key as number))).join('')
      );

export const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
