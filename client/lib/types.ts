// Backend entity types

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  GUEST = 'guest',
}

export enum RoomType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRESIDENTIAL = 'presidential',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

export enum OrderType {
  FOOD = 'food',
  BEVERAGE = 'beverage',
  COMBO = 'combo',
  OTHER = 'other',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum MaintenanceCategory {
  HVAC = 'hvac',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  FURNITURE = 'furniture',
  CLEANING = 'cleaning',
  APPLIANCES = 'appliances',
  OTHER = 'other',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum InquiryStatus {
  RECEIVED = 'received',
  ADDRESSED = 'addressed',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  phone: string;
  email: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  status: RoomStatus;
  floor?: number;
  description?: string;
  hotelId: string;
  hotel?: Hotel;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalPrice: number;
  specialRequests?: string;
  user?: User;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  bookingId: string;
  roomId: string;
  orderType: OrderType;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  booking?: Booking;
  room?: Room;
  orderedAt: string;
  deliveredAt?: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  hotelId: string;
  roomId: string;
  bookingId: string;
  userId: string;
  description: string;
  descriptionAmharic?: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  phoneNumber?: string;
  originalMessage?: string;
  originalMessageAmharic?: string;
  aiAnalysis?: string;
  hotel?: Hotel;
  room?: Room;
  booking?: Booking;
  user?: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phoneNumber: string;
  message: string;
  messageAmharic?: string;
  messageEnglish?: string;
  status: InquiryStatus;
  originalLanguage?: string;
  aiAnalysis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  addressedAt?: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateBookingRequest {
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  specialRequests?: string;
}

export interface CreateOrderRequest {
  bookingId: string;
  roomId: string;
  orderType: OrderType;
  items: OrderItem[];
  totalPrice: number;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
