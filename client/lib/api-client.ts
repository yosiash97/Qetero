import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Hotel,
  Room,
  Booking,
  Order,
  Maintenance,
  Inquiry,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateBookingRequest,
  CreateOrderRequest,
  RoomStatus,
  OrderStatus,
  MaintenanceStatus,
  InquiryStatus,
  PaginatedResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<User> {
    const response = await this.client.post<User>('/users', data);
    return response.data;
  }

  // Hotel endpoints
  async getHotels(city?: string): Promise<Hotel[]> {
    const response = await this.client.get<Hotel[]>('/hotels', {
      params: city ? { city } : undefined,
    });
    return response.data;
  }

  async getHotelById(id: string): Promise<Hotel> {
    const response = await this.client.get<Hotel>(`/hotels/${id}`);
    return response.data;
  }

  async createHotel(data: Partial<Hotel>): Promise<Hotel> {
    const response = await this.client.post<Hotel>('/hotels', data);
    return response.data;
  }

  // Room endpoints
  async getRooms(): Promise<Room[]> {
    const response = await this.client.get<Room[]>('/rooms');
    return response.data;
  }

  async getRoomById(id: string): Promise<Room> {
    const response = await this.client.get<Room>(`/rooms/${id}`);
    return response.data;
  }

  async getRoomsByHotel(hotelId: string): Promise<Room[]> {
    const response = await this.client.get<Room[]>(`/rooms/hotel/${hotelId}`);
    return response.data;
  }

  async getAvailableRooms(
    hotelId?: string,
    checkIn?: string,
    checkOut?: string,
    beds?: number,
    bathrooms?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Room>> {
    const response = await this.client.get<PaginatedResponse<Room>>('/rooms/available', {
      params: { hotelId, checkIn, checkOut, beds, bathrooms, page, limit },
    });
    return response.data;
  }

  async updateRoomStatus(id: string, status: RoomStatus): Promise<Room> {
    const response = await this.client.patch<Room>(`/rooms/${id}/status`, { status });
    return response.data;
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    const response = await this.client.post<Room>('/rooms', data);
    return response.data;
  }

  // Booking endpoints
  async getBookings(userId?: string, roomId?: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>('/bookings', {
      params: { userId, roomId },
    });
    return response.data;
  }

  async getBookingById(id: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await this.client.post<Booking>('/bookings', data);
    return response.data;
  }

  async checkIn(bookingId: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${bookingId}/check-in`);
    return response.data;
  }

  async checkOut(bookingId: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${bookingId}/check-out`);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${bookingId}/cancel`);
    return response.data;
  }

  async deleteBooking(id: string): Promise<void> {
    await this.client.delete(`/bookings/${id}`);
  }

  // Order endpoints
  async getOrders(bookingId?: string, roomId?: string, status?: OrderStatus): Promise<Order[]> {
    const response = await this.client.get<Order[]>('/orders', {
      params: { bookingId, roomId, status },
    });
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await this.client.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await this.client.post<Order>('/orders', data);
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await this.client.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await this.client.delete(`/orders/${id}`);
  }

  // Maintenance endpoints
  async getMaintenanceRequests(
    hotelId?: string,
    priority?: string,
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Maintenance>> {
    const response = await this.client.get<PaginatedResponse<Maintenance>>('/maintenance', {
      params: { hotelId, priority, category, page, limit },
    });
    return response.data;
  }

  async getMaintenanceById(id: string): Promise<Maintenance> {
    const response = await this.client.get<Maintenance>(`/maintenance/${id}`);
    return response.data;
  }

  async updateMaintenanceStatus(id: string, status: MaintenanceStatus): Promise<Maintenance> {
    const response = await this.client.patch<Maintenance>(`/maintenance/${id}`, { status });
    return response.data;
  }

  async deleteMaintenanceRequest(id: string): Promise<void> {
    await this.client.delete(`/maintenance/${id}`);
  }

  // Inquiry endpoints
  async getInquiries(
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Inquiry>> {
    const response = await this.client.get<PaginatedResponse<Inquiry>>('/inquiries', {
      params: { status, page, limit },
    });
    return response.data;
  }

  async getInquiryById(id: string): Promise<Inquiry> {
    const response = await this.client.get<Inquiry>(`/inquiries/${id}`);
    return response.data;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const response = await this.client.patch<Inquiry>(`/inquiries/${id}`, { status });
    return response.data;
  }

  async updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
    const response = await this.client.patch<Inquiry>(`/inquiries/${id}`, data);
    return response.data;
  }

  async deleteInquiry(id: string): Promise<void> {
    await this.client.delete(`/inquiries/${id}`);
  }
}

export const apiClient = new ApiClient();
