"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import type { Booking, BookingStatus } from "@/lib/types";
import { Calendar, User, DoorOpen, DoorClosed, XCircle, Trash2 } from "lucide-react";
import { CheckoutDialog } from "./checkout-dialog";

type BookingsListProps = {
  bookings: Booking[];
  onRefresh: () => void;
};

export function BookingsList({ bookings, onRefresh }: BookingsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, { variant: any; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      confirmed: { variant: "secondary", label: "Confirmed" },
      checked_in: { variant: "default", label: "Checked In" },
      checked_out: { variant: "outline", label: "Checked Out" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    return variants[status];
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      setLoading(bookingId);
      setError("");
      await apiClient.checkIn(bookingId);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check in");
    } finally {
      setLoading(null);
    }
  };

  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setCheckoutDialogOpen(true);
  };

  const handleCheckoutComplete = () => {
    onRefresh();
    setSelectedBooking(null);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setLoading(bookingId);
      setError("");
      await apiClient.cancelBooking(bookingId);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking? This cannot be undone.")) return;

    try {
      setLoading(bookingId);
      setError("");
      await apiClient.deleteBooking(bookingId);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete booking");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings ({bookings.length})</CardTitle>
        <CardDescription>Manage guest bookings and check-ins/check-outs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No bookings found</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {booking.user
                            ? `${booking.user.firstName} ${booking.user.lastName}`
                            : "Unknown Guest"}
                        </h3>
                        <Badge {...getStatusBadge(booking.status)} variant={getStatusBadge(booking.status).variant}>
                          {getStatusBadge(booking.status).label}
                        </Badge>
                      </div>
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {booking.user?.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.checkInDate).toLocaleDateString()} -{" "}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </div>
                        <p>Room: {booking.room?.roomNumber || "N/A"}</p>
                        <p className="font-semibold text-foreground">
                          Total: ${Number(booking.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(booking.id)}
                          disabled={loading === booking.id}
                        >
                          <DoorOpen className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      )}
                      {booking.status === "checked_in" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(booking)}
                          disabled={loading === booking.id}
                        >
                          <DoorClosed className="h-4 w-4 mr-2" />
                          Check Out
                        </Button>
                      )}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(booking.id)}
                          disabled={loading === booking.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(booking.id)}
                        disabled={loading === booking.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <CheckoutDialog
        booking={selectedBooking}
        open={checkoutDialogOpen}
        onOpenChange={setCheckoutDialogOpen}
        onCheckoutComplete={handleCheckoutComplete}
      />
    </Card>
  );
}
