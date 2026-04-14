import { useState, useEffect } from 'react'

export const useAuthForm = (navigation: any) => {
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [phoneError, setPhoneError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true)
  const [isEmailTyping, setEmailTyping] = useState<boolean>(false)
  const [isCallTyping, setCallTyping] = useState<boolean>(false)
  const [isPwdTyping, setPwdTyping] = useState<boolean>(false)
  const [isConfTyping, setConfPwdTyping] = useState<boolean>(false)

  const validateEmail = (): boolean => {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address')
      return false
    } else {
      setEmailError('')
      return true
    }
  }

  const validatePhone = (): boolean => {
    const phoneRegex: RegExp = /^\d{10}$/
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number')
      return false
    } else {
      setPhoneError('')
      return true
    }
  }

  const validatePassword = (): boolean => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    } else {
      setPasswordError('')
      return true
    }
  }

  const validateConfirmPassword = (): boolean => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return false
    } else {
      setConfirmPasswordError('')
      return true
    }
  }

  useEffect(() => {
    const isEmailValid: boolean = validateEmail()
    const isPhoneValid: boolean = validatePhone()
    const isPasswordValid: boolean = validatePassword()
    const isConfirmPasswordValid: boolean = validateConfirmPassword()

    const isDisabled: boolean =
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid

    setButtonDisabled(isDisabled)
  }, [email, phone, password, confirmPassword])

  const handleSignUp = (): void => {
    if (!isButtonDisabled) {
      navigation.navigate('LoaderScreen')
    }
  }

  return {
    email,
    phone,
    password,
    confirmPassword,
    emailError,
    phoneError,
    passwordError,
    confirmPasswordError,
    isButtonDisabled,
    isEmailTyping,
    isCallTyping,
    isPwdTyping,
    isConfTyping,
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword,
    setEmail,
    setPhone,
    setPassword,
    setConfirmPassword,
    setEmailTyping,
    setCallTyping,
    setPwdTyping,
    setConfPwdTyping,
    handleSignUp,
  }
}
