export const debounce = (func: any, ms: number) => {
  let timeout: any;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), ms);
  };
};

export const delay = (ms: number) => {
  return new Promise((r) => {
    setTimeout(() => {
      r(true);
    }, ms);
  });
};
