// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'merchant' | 'driver' | 'admin'

export type DeliveryStatus =
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

export type VehicleType = 'bike' | 'scooter' | 'car' | 'van'

// Codes postaux Île-de-France: 75, 77, 78, 91, 92, 93, 94, 95
export type IleDeFranceDept = '75' | '77' | '78' | '91' | '92' | '93' | '94' | '95'

// ─── Geo ──────────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Address {
  street: string
  city: string
  postalCode: string
  coords: GeoPoint
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
}

export interface MerchantProfile {
  userId: string
  shopName: string
  siret: string // 14 chiffres
  address: Address
  stripeAccountId?: string
}

export interface DriverProfile {
  userId: string
  firstName: string
  lastName: string
  vehicleType: VehicleType
  isAvailable: boolean
  currentLocation?: GeoPoint
  zones: string[] // codes postaux couverts
  stripeAccountId?: string
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface PackageInfo {
  description: string
  weightKg: number
  isFragile: boolean
}

export interface Delivery {
  id: string
  merchantId: string
  driverId?: string
  status: DeliveryStatus
  pickup: Address
  dropoff: Address
  packageInfo: PackageInfo
  priceInCents: number
  scheduledAt?: string
  acceptedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  createdAt: string
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: {
    code: string
    message: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// ─── WebSocket events ─────────────────────────────────────────────────────────

export interface DriverLocationEvent {
  driverId: string
  location: GeoPoint
}

export interface DeliveryStatusEvent {
  deliveryId: string
  status: DeliveryStatus
  updatedAt: string
}
