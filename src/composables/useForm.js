// src/composables/useForm.js
import { reactive, ref } from 'vue'

export function useForm(initialValues = {}, rules = {}) {
  const form = reactive({ ...initialValues })
  const errors = reactive({})
  const submitting = ref(false)

  function validate() {
    Object.keys(errors).forEach(k => delete errors[k])
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const error = rule(form[field], form)
        if (error) { errors[field] = error; break }
      }
    }
    return Object.keys(errors).length === 0
  }

  function reset() {
    Object.assign(form, initialValues)
    Object.keys(errors).forEach(k => delete errors[k])
  }

  return { form, errors, submitting, validate, reset }
}

// Common validation rules
export const required = (msg = 'Campo obrigatório') => (v) => !v ? msg : null
export const email = (msg = 'E-mail inválido') => (v) => v && !/.+@.+\..+/.test(v) ? msg : null
export const minLength = (min, msg) => (v) => v && v.length < min ? (msg || `Mínimo ${min} caracteres`) : null
export const min = (minVal, msg) => (v) => Number(v) < minVal ? (msg || `Mínimo ${minVal}`) : null
