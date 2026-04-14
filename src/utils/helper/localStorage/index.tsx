import AsyncStorage from '@react-native-async-storage/async-storage'

const setValue = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value)
}

const getValue = async (value: string): Promise<string | null> => {
  const val: string | null = await AsyncStorage.getItem(value)
  return val
}

const deleteValue = async (value: string): Promise<void> => {
  await AsyncStorage.removeItem(value)
}

const deleteMultipleValue = async (value: string[]): Promise<void> => {
  await AsyncStorage.multiRemove(value)
}

const clearValue = async (): Promise<void> => {
  await AsyncStorage.clear()
}

export { setValue, getValue, deleteValue, clearValue, deleteMultipleValue }
