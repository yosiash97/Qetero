"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import type { Room, Booking } from "@/lib/types";
import { Search, Bed, Bath, DollarSign, UserPlus } from "lucide-react";

type RoomAvailabilityProps = {
  rooms: Room[];
  bookings: Booking[];
  onRefresh: () => void;
};

export function RoomAvailability({ rooms, bookings, onRefresh }: RoomAvailabilityProps) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Filter state
  const [bedsFilter, setBedsFilter] = useState<number | undefined>(undefined);
  const [bathroomsFilter, setBathroomsFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadAvailableRooms();
  }, [currentPage, bedsFilter, bathroomsFilter]);

  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await apiClient.getAvailableRooms(
        undefined,
        undefined,
        undefined,
        bedsFilter,
        bathroomsFilter,
        currentPage,
        10
      );
      setAvailableRooms(response.data);
      setTotalPages(response.totalPages);
      setTotalRooms(response.total);
    } catch (err) {
      console.error("Failed to load available rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setDialogOpen(true);
    setError("");
    // Set check-in to today (fixed) and default check-out to tomorrow
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setCheckIn(today); // Always today for walk-in
    setCheckOut(tomorrow);
  };

  const handleCreateBooking = async () => {
    if (!selectedRoom) {
      setError("No room selected");
      return;
    }

    if (!guestFirstName || !guestLastName || !guestEmail) {
      setError("Please enter guest first name, last name, and email");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Ensure check-out is at least tomorrow
      if (checkOutDate <= today) {
        setError("Check-out date must be at least tomorrow");
        setLoading(false);
        return;
      }

      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights < 1) {
        setError("Check-out date must be after check-in date");
        setLoading(false);
        return;
      }

      const totalPrice = selectedRoom.pricePerNight * nights;

      // Create guest user first
      const newUser = await apiClient.createUser({
        email: guestEmail,
        password: `guest${Date.now()}`, // Auto-generated password
        firstName: guestFirstName,
        lastName: guestLastName,
        phone: guestPhone || undefined,
      });

      // Create booking with the new user
      await apiClient.createBooking({
        userId: newUser.id,
        roomId: selectedRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice,
      });

      alert(`Guest ${guestFirstName} ${guestLastName} checked into Room ${selectedRoom.roomNumber}!`);
      setDialogOpen(false);
      resetForm();
      onRefresh();
      loadAvailableRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRoom(null);
    setCheckIn("");
    setCheckOut("");
    setGuestFirstName("");
    setGuestLastName("");
    setGuestEmail("");
    setGuestPhone("");
    setError("");
  };

  const calculateTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    return selectedRoom.pricePerNight * nights;
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Availability</CardTitle>
          <CardDescription>
            Click on a room to assign a guest and create a booking
            {totalRooms > 0 && ` (${totalRooms} available rooms)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select
                value={bedsFilter?.toString() || "all"}
                onValueChange={(value) => {
                  setBedsFilter(value === "all" ? undefined : parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Beds</SelectItem>
                  <SelectItem value="1">1+ Bed</SelectItem>
                  <SelectItem value="2">2+ Beds</SelectItem>
                  <SelectItem value="3">3+ Beds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select
                value={bathroomsFilter?.toString() || "all"}
                onValueChange={(value) => {
                  setBathroomsFilter(value === "all" ? undefined : parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bathrooms</SelectItem>
                  <SelectItem value="1">1+ Bathroom</SelectItem>
                  <SelectItem value="2">2+ Bathrooms</SelectItem>
                  <SelectItem value="3">3+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(bedsFilter || bathroomsFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBedsFilter(undefined);
                  setBathroomsFilter(undefined);
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {loadingRooms ? (
            <p className="text-center text-muted-foreground py-8">Loading rooms...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableRooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => handleRoomClick(room)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
                      <Badge variant="secondary">{room.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4" />
                        <span>{room.beds} {room.beds === 1 ? 'Bed' : 'Beds'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4" />
                        <span>{room.bathrooms} {room.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">${room.pricePerNight}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    {room.floor && (
                      <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                    )}
                    <Button size="sm" className="w-full mt-2" onClick={(e) => {
                      e.stopPropagation();
                      handleRoomClick(room);
                    }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Guest
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>

              {availableRooms.length === 0 && !loadingRooms && (
                <p className="text-center text-muted-foreground py-8">No available rooms</p>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || loadingRooms}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loadingRooms}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Guest to Room {selectedRoom?.roomNumber}</DialogTitle>
            <DialogDescription>
              Fill in the details to create a booking for this room
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}

            {/* Room Details */}
            {selectedRoom && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Room {selectedRoom.roomNumber}</span>
                  <Badge>{selectedRoom.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Capacity: {selectedRoom.capacity} guests</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" />
                      <span>{selectedRoom.beds} {selectedRoom.beds === 1 ? 'Bed' : 'Beds'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" />
                      <span>{selectedRoom.bathrooms} {selectedRoom.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                    </div>
                  </div>
                  <p>Floor: {selectedRoom.floor}</p>
                  <p className="font-semibold mt-2">${selectedRoom.pricePerNight}/night</p>
                </div>
              </div>
            )}

            {/* Guest Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Guest Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Check-in Date (Today - Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-In Date (Today)</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Walk-in guests check in today
              </p>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-Out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least tomorrow
              </p>
            </div>

            {/* Total Price */}
            {checkIn && checkOut && selectedRoom && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Price</span>
                  <span className="text-2xl font-bold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBooking} disabled={loading}>
              {loading ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
