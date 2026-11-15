const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u
const EMAIL_PATTERN = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i
const PHONE_PATTERN = /^0\d{9}$/

export function isValidPersonName(value: string) {
  const name = value.trim()
  return name.length >= 2 && PERSON_NAME_PATTERN.test(name)
}

export function isValidEmail(value: string) {
  const email = value.trim()
  const [localPart] = email.split('@')
  return EMAIL_PATTERN.test(email) && !localPart.startsWith('.') && !localPart.endsWith('.') && !localPart.includes('..')
}

export function isValidVietnamesePhone(value: string) {
  return PHONE_PATTERN.test(value.trim())
}

export function requiredFieldError(value: string, label: string) {
  return value.trim() ? '' : `Vui lòng nhập ${label}.`
}
