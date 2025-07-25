import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToStorage = async (key, value) => {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.log("Storage Save Error:", error);
  }
};

export const getFromStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.log("Storage Get Error:", error);
    return null;
  }
};
