export const setItem = (key, value) => {
  if (value === undefined) return;

  
  const toStore = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, toStore);
};

export const getItem = (key, defaultValue = null) => {
  const value = localStorage.getItem(key);
  if (!value) return defaultValue;

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};

export const clearAll = () => {
  localStorage.clear();
};
