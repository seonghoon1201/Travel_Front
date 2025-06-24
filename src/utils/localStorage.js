export const setItem = (key, value) => {
  if (value === undefined) return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = (key, defaultValue = null) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};

export const clearAll = () => {
  localStorage.clear();
};
