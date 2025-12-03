"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import type { Room, Booking, Order } from "@/lib/types";
import { RoomAvailability } from "@/components/room-availability";
import { BookingsList } from "@/components/bookings-list";
import { ItemsManager } from "@/components/items-manager";
import { MaintenanceList } from "@/components/maintenance-list";
import { Calendar, Package, List, LogOut, User, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, bookingsData, ordersData] = await Promise.all([
        apiClient.getRooms(),
        apiClient.getBookings(),
        apiClient.getOrders(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setOrders(ordersData);
      setError("");
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Hotel Management Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage guest check-ins and room bookings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.firstName} {user.lastName}</span>
                <span className="text-muted-foreground">({user.role})</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="check-in" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="check-in" className="gap-2">
                <Calendar className="h-4 w-4" />
                Rooms & Check-In
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <List className="h-4 w-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="items" className="gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="check-in" className="space-y-6">
              <RoomAvailability rooms={rooms} bookings={bookings} onRefresh={loadData} />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BookingsList bookings={bookings} onRefresh={loadData} />
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <ItemsManager orders={orders} bookings={bookings} onRefresh={loadData} />
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <MaintenanceList />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
