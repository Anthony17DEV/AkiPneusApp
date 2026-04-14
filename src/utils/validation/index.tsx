export const validateEmail = (email: string): string => {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? '' : 'Invalid email address'
}

export const validatePassword = (password: string): string => {
  return password.length >= 6 ? '' : 'Password must be at least 6 characters'
}

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string => {
  return password === confirmPassword ? '' : 'Passwords do not match'
}
