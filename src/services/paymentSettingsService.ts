import { apiClient, type ApiEnvelope } from '@/services/api'

export interface PaymentSettings {
  accountName: string
  paymentType: 'PHONE' | 'MERCHANT'
  phoneNumber?: string
  merchantCode?: string
  ussdTemplate: string
  ussdCode: string
}
interface Dto {
  account_name: string
  payment_type: 'PHONE' | 'MERCHANT'
  phone_number?: string
  merchant_code?: string
  ussd_template: string
  ussd_code: string
}
const map = (v: Dto): PaymentSettings => ({
  accountName: v.account_name,
  paymentType: v.payment_type,
  phoneNumber: v.phone_number,
  merchantCode: v.merchant_code,
  ussdTemplate: v.ussd_template,
  ussdCode: v.ussd_code,
})
export async function getPaymentSettings(admin = false) {
  const { data } = await apiClient.get<ApiEnvelope<Dto>>(
    admin ? '/admin/payment-settings/' : '/payment-settings/',
  )
  return map(data.data)
}
export async function updatePaymentSettings(v: PaymentSettings) {
  const { data } = await apiClient.put<ApiEnvelope<Dto>>('/admin/payment-settings/', {
    account_name: v.accountName,
    payment_type: v.paymentType,
    phone_number: v.phoneNumber || null,
    merchant_code: v.merchantCode || null,
    ussd_template: v.ussdTemplate,
  })
  return map(data.data)
}
