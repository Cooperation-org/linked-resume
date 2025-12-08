import Cookies from 'js-cookie'

export const setLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

export const getLocalStorage = (key: string) => {
  return localStorage.getItem(key)
}

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key)
}

export const removeCookie = (name: string) => {
  Cookies.remove(name)
}
