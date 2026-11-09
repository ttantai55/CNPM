export const BANK_ACCOUNT = {
  bankName: 'Vietcombank',
  bankBin: '970436',
  accountNumber: '0123456789',
  accountName: 'QUAN NUOC BREWLITE',
  momoPhone: '0901234567',
}

export function transferContent(orderCode: string) {
  return `BREWLITE ${orderCode}`
}

function tlv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`
}

function crc16(input: string) {
  let crc = 0xffff
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Builds an EMVCo / NAPAS VietQR payload that banking apps can scan. */
export function buildVietQrPayload(amount: number, content: string) {
  const merchant = tlv(
    '38',
    tlv('00', 'A000000727') +
      tlv('01', tlv('00', BANK_ACCOUNT.bankBin) + tlv('01', BANK_ACCOUNT.accountNumber)) +
      tlv('02', 'QRIBFTTA'),
  )
  const body =
    tlv('00', '01') +
    tlv('01', '12') +
    merchant +
    tlv('53', '704') +
    tlv('54', String(Math.round(amount))) +
    tlv('58', 'VN') +
    tlv('62', tlv('08', content)) +
    '6304'
  return body + crc16(body)
}

export function buildMomoPayload(amount: number, orderCode: string) {
  const params = new URLSearchParams({
    action: 'payWithApp',
    phone: BANK_ACCOUNT.momoPhone,
    amount: String(Math.round(amount)),
    comment: transferContent(orderCode),
  })
  return `https://nhantien.momo.vn/?${params.toString()}`
}
