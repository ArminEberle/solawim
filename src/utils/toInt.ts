export const toInt = (val: string): number => {
  const result = Number.parseInt(val);
  if (Number.isNaN(result)) {
      return 0;
  }
  return result;
};
