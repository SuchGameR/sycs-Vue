/**
 * フォームのインライン検証。
 *
 * ルールは「値を渡すと true かエラーメッセージを返す関数」。
 * touched になったフィールドだけエラーを表示するので、入力中に
 * 赤くなりすぎない。
 */

export type ValidationRule = (value: unknown) => string | true

export const validators = {
  required:
    (message = '必須項目です'): ValidationRule =>
    (value) =>
      (Array.isArray(value) ? value.length > 0 : String(value ?? '').trim().length > 0) ||
      message,

  minLength:
    (length: number, message?: string): ValidationRule =>
    (value) =>
      String(value ?? '').length >= length ||
      (message ?? `${length}文字以上で入力してください`),

  maxLength:
    (length: number, message?: string): ValidationRule =>
    (value) =>
      String(value ?? '').length <= length ||
      (message ?? `${length}文字以内で入力してください`),

  pattern:
    (regex: RegExp, message: string): ValidationRule =>
    (value) =>
      regex.test(String(value ?? '')) || message,

  email:
    (message = 'メールアドレスの形式が正しくありません'): ValidationRule =>
    (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '')) || message,

  sameAs:
    (getOther: () => unknown, message = '値が一致しません'): ValidationRule =>
    (value) =>
      value === getOther() || message,

  custom:
    (fn: (value: unknown) => boolean, message: string): ValidationRule =>
    (value) =>
      fn(value) || message,
}

export function useFormValidation<T extends Record<string, unknown>>(
  initial: T,
  schema: Partial<Record<keyof T, ValidationRule[]>>,
) {
  const values = reactive({ ...initial }) as T
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const submitted = ref(false)

  function rulesFor(key: keyof T): ValidationRule[] {
    return schema[key] ?? []
  }

  function validateField(key: keyof T, force = false): boolean {
    if (!force && !touched[key as string] && !submitted.value) return true
    const message = rulesFor(key)
      .map((rule) => rule(values[key]))
      .find((result): result is string => typeof result === 'string')
    if (message) errors[key as string] = message
    else delete errors[key as string]
    return !message
  }

  function touch(key: keyof T) {
    touched[key as string] = true
    validateField(key, true)
  }

  function validateAll(): boolean {
    submitted.value = true
    let ok = true
    for (const key of Object.keys(schema) as (keyof T)[]) {
      touched[key as string] = true
      if (!validateField(key, true)) ok = false
    }
    return ok
  }

  function reset(next?: Partial<T>) {
    Object.assign(values, initial, next ?? {})
    for (const key of Object.keys(errors)) delete errors[key]
    for (const key of Object.keys(touched)) delete touched[key]
    submitted.value = false
  }

  const isValid = computed(() =>
    (Object.keys(schema) as (keyof T)[]).every((key) =>
      rulesFor(key).every((rule) => rule(values[key]) === true),
    ),
  )

  return {
    values,
    errors,
    touched,
    submitted,
    isValid,
    touch,
    validateField,
    validateAll,
    reset,
  }
}
