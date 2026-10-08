export const CATEGORIES = [
  '웨딩영상',
  '본식스냅',
  '예식장',
  '드레스',
  '헤어/메이크업',
  '한복',
  '출장뷔페',
  '축하화환',
] as const

export type Category = (typeof CATEGORIES)[number]

export const REGIONS = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
] as const

export type Region = (typeof REGIONS)[number]

export interface District {
  name: string
  lat: number
  lng: number
}

export interface RegionInfo {
  center: [number, number]
  zoom: number
  districts: District[]
}

export const REGION_DATA: Record<Region, RegionInfo> = {
  서울: {
    center: [37.5665, 126.978],
    zoom: 11,
    districts: [
      { name: '강남구', lat: 37.5172, lng: 127.0473 },
      { name: '서초구', lat: 37.4837, lng: 127.0324 },
      { name: '송파구', lat: 37.5145, lng: 127.106 },
      { name: '마포구', lat: 37.5637, lng: 126.9084 },
      { name: '종로구', lat: 37.573, lng: 126.9794 },
      { name: '영등포구', lat: 37.5264, lng: 126.8963 },
    ],
  },
  경기: {
    center: [37.4138, 127.0],
    zoom: 9,
    districts: [
      { name: '수원시', lat: 37.2636, lng: 127.0286 },
      { name: '성남시', lat: 37.42, lng: 127.1266 },
      { name: '고양시', lat: 37.6584, lng: 126.832 },
      { name: '용인시', lat: 37.2411, lng: 127.1776 },
      { name: '부천시', lat: 37.5035, lng: 126.766 },
      { name: '안양시', lat: 37.3943, lng: 126.9568 },
    ],
  },
  인천: {
    center: [37.4563, 126.7052],
    zoom: 11,
    districts: [
      { name: '중구', lat: 37.4738, lng: 126.6216 },
      { name: '남동구', lat: 37.4467, lng: 126.7314 },
      { name: '부평구', lat: 37.5075, lng: 126.7218 },
      { name: '연수구', lat: 37.4106, lng: 126.6785 },
      { name: '서구', lat: 37.5457, lng: 126.676 },
    ],
  },
  강원: {
    center: [37.8228, 128.1555],
    zoom: 8,
    districts: [
      { name: '춘천시', lat: 37.8813, lng: 127.73 },
      { name: '원주시', lat: 37.3422, lng: 127.9202 },
      { name: '강릉시', lat: 37.7519, lng: 128.8761 },
      { name: '속초시', lat: 38.207, lng: 128.5918 },
      { name: '동해시', lat: 37.5247, lng: 129.1143 },
    ],
  },
  충북: {
    center: [36.8, 127.7],
    zoom: 9,
    districts: [
      { name: '청주시', lat: 36.6424, lng: 127.489 },
      { name: '충주시', lat: 36.991, lng: 127.926 },
      { name: '제천시', lat: 37.1326, lng: 128.191 },
      { name: '음성군', lat: 36.9403, lng: 127.6905 },
    ],
  },
  충남: {
    center: [36.5, 126.8],
    zoom: 9,
    districts: [
      { name: '천안시', lat: 36.8151, lng: 127.1139 },
      { name: '아산시', lat: 36.7898, lng: 127.0018 },
      { name: '서산시', lat: 36.7848, lng: 126.4503 },
      { name: '공주시', lat: 36.4465, lng: 127.119 },
      { name: '논산시', lat: 36.1872, lng: 127.0987 },
    ],
  },
  대전: {
    center: [36.3504, 127.3845],
    zoom: 11,
    districts: [
      { name: '유성구', lat: 36.3623, lng: 127.3563 },
      { name: '서구', lat: 36.3554, lng: 127.3838 },
      { name: '중구', lat: 36.3255, lng: 127.4213 },
      { name: '동구', lat: 36.3117, lng: 127.4548 },
      { name: '대덕구', lat: 36.3466, lng: 127.4157 },
    ],
  },
  세종: {
    center: [36.4801, 127.289],
    zoom: 11,
    districts: [
      { name: '조치원읍', lat: 36.6011, lng: 127.2967 },
      { name: '한솔동', lat: 36.4801, lng: 127.289 },
      { name: '도담동', lat: 36.5074, lng: 127.2596 },
    ],
  },
  전북: {
    center: [35.7175, 127.153],
    zoom: 9,
    districts: [
      { name: '전주시', lat: 35.8242, lng: 127.148 },
      { name: '군산시', lat: 35.9676, lng: 126.7369 },
      { name: '익산시', lat: 35.9483, lng: 126.9578 },
      { name: '정읍시', lat: 35.5699, lng: 126.8558 },
    ],
  },
  전남: {
    center: [34.8679, 126.991],
    zoom: 8,
    districts: [
      { name: '여수시', lat: 34.7604, lng: 127.6622 },
      { name: '순천시', lat: 34.9506, lng: 127.4874 },
      { name: '목포시', lat: 34.8118, lng: 126.3922 },
      { name: '광양시', lat: 34.9407, lng: 127.6959 },
      { name: '나주시', lat: 35.016, lng: 126.7108 },
    ],
  },
  광주: {
    center: [35.1595, 126.8526],
    zoom: 11,
    districts: [
      { name: '동구', lat: 35.1461, lng: 126.9231 },
      { name: '서구', lat: 35.1518, lng: 126.8901 },
      { name: '남구', lat: 35.133, lng: 126.9024 },
      { name: '북구', lat: 35.174, lng: 126.912 },
      { name: '광산구', lat: 35.1396, lng: 126.7938 },
    ],
  },
  경북: {
    center: [36.4919, 128.8889],
    zoom: 8,
    districts: [
      { name: '포항시', lat: 36.019, lng: 129.3435 },
      { name: '경주시', lat: 35.8562, lng: 129.2247 },
      { name: '구미시', lat: 36.1196, lng: 128.3446 },
      { name: '안동시', lat: 36.5684, lng: 128.7294 },
      { name: '경산시', lat: 35.8251, lng: 128.7414 },
    ],
  },
  경남: {
    center: [35.4606, 128.4132],
    zoom: 9,
    districts: [
      { name: '창원시', lat: 35.228, lng: 128.6811 },
      { name: '김해시', lat: 35.2285, lng: 128.8894 },
      { name: '진주시', lat: 35.1799, lng: 128.1076 },
      { name: '양산시', lat: 35.335, lng: 129.0374 },
      { name: '거제시', lat: 34.8807, lng: 128.6212 },
      { name: '통영시', lat: 34.8544, lng: 128.4331 },
    ],
  },
  대구: {
    center: [35.8714, 128.6014],
    zoom: 11,
    districts: [
      { name: '중구', lat: 35.8693, lng: 128.6062 },
      { name: '수성구', lat: 35.8583, lng: 128.6307 },
      { name: '달서구', lat: 35.8299, lng: 128.5327 },
      { name: '북구', lat: 35.8858, lng: 128.5828 },
      { name: '동구', lat: 35.8866, lng: 128.6353 },
    ],
  },
  울산: {
    center: [35.5384, 129.3114],
    zoom: 11,
    districts: [
      { name: '남구', lat: 35.5436, lng: 129.33 },
      { name: '중구', lat: 35.5695, lng: 129.3324 },
      { name: '동구', lat: 35.5049, lng: 129.4166 },
      { name: '북구', lat: 35.5827, lng: 129.3612 },
      { name: '울주군', lat: 35.5222, lng: 129.2424 },
    ],
  },
  부산: {
    center: [35.1796, 129.0756],
    zoom: 11,
    districts: [
      { name: '해운대구', lat: 35.1631, lng: 129.1637 },
      { name: '부산진구', lat: 35.1631, lng: 129.053 },
      { name: '수영구', lat: 35.1454, lng: 129.1132 },
      { name: '동래구', lat: 35.2049, lng: 129.0836 },
      { name: '사하구', lat: 35.1043, lng: 128.9748 },
    ],
  },
  제주: {
    center: [33.489, 126.4983],
    zoom: 10,
    districts: [
      { name: '제주시', lat: 33.4996, lng: 126.5312 },
      { name: '서귀포시', lat: 33.2542, lng: 126.56 },
      { name: '애월읍', lat: 33.463, lng: 126.31 },
      { name: '성산읍', lat: 33.4586, lng: 126.942 },
      { name: '한림읍', lat: 33.413, lng: 126.268 },
    ],
  },
}

export type VendorStatus = 'pending' | 'approved'

export interface VendorOption {
  id: string
  label: string
  price: number
}

export interface Vendor {
  id: string
  email: string
  password: string
  profilePhoto: string
  thumbnail: string
  businessName: string
  representativeName: string
  category: Category
  region: Region
  district?: string
  basePrice: number
  portfolioImages: string[]
  youtubeLinks: string[]
  hoverPreview: string
  introText: string
  options: VendorOption[]
  bookedDates: string[]
  status: VendorStatus
  boosted: boolean
  createdAt: number
}

export interface Review {
  id: string
  vendorId: string
  customerName: string
  text: string
  photos: string[]
  createdAt: number
}

export type PaymentStatus = 'pending' | 'paid' | 'confirmed'
export type EscrowStage = 'none' | 'holding' | 'delivered' | 'settled'

export interface Invoice {
  id: string
  vendorId: string
  vendorName: string
  customerId: string
  customerName: string
  amount: number
  memo: string
  weddingDate: string
  venue: string
  method: string
  referralCode: string
  discount: number
  finalAmount: number
  paymentStatus: PaymentStatus
  escrowStage: EscrowStage
  createdAt: number
  paidAt: number | null
}

export interface Inquiry {
  id: string
  vendorId: string
  vendorName: string
  category: Category
  customerId: string
  customerName: string
  contact: string
  weddingDate: string
  venue: string
  message: string
  selectedOptions: string[]
  estimatedTotal: number
  referralCode: string
  // category-specific
  ribbonText: string
  senderName: string
  minGuests: number
  tastingRequested: boolean
  status: 'new' | 'responded'
  createdAt: number
}

export interface Customer {
  id: string
  name: string
  email: string
  password: string
  referralCode: string
  referredBy: string
  weddingDate: string
  ceremonyOrder: string
  invitationLink: string
  shootingRequest: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  vendorId: string
  customerId: string
  sender: 'vendor' | 'customer'
  kind: 'text' | 'invoice'
  text: string
  invoiceId: string
  createdAt: number
  readByCustomer: boolean
  readByVendor: boolean
}

export const REFERRAL_DISCOUNT_RATE = 0.05

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  return m ? m[1] : null
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(price)) + '원'
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export const CATEGORY_IMAGE: Record<Category, string> = {
  웨딩영상: '/images/wedding-1.png',
  본식스냅: '/images/wedding-5.png',
  예식장: '/images/venue.png',
  드레스: '/images/dress.png',
  '헤어/메이크업': '/images/wedding-6.png',
  한복: '/images/hanbok.png',
  출장뷔페: '/images/buffet.png',
  축하화환: '/images/wreath.png',
}
