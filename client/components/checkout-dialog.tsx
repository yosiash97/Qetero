"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import type { Booking, Order } from "@/lib/types";
import { Receipt, CreditCard } from "lucide-react";

type CheckoutDialogProps = {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckoutComplete: () => void;
};

export function CheckoutDialog({
  booking,
  open,
  onOpenChange,
  onCheckoutComplete,
}: CheckoutDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && booking) {
      loadOrders();
    }
  }, [open, booking]);

  const loadOrders = async () => {
    if (!booking) return;

    try {
      setLoadingOrders(true);
      const allOrders = await apiClient.getOrders(booking.id);
      setOrders(allOrders);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!booking) return;

    try {
      setLoading(true);
      setError("");
      await apiClient.checkOut(booking.id);
      onCheckoutComplete();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const roomCharges = Number(booking.totalPrice);
  const ordersTotal = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const finalTotal = roomCharges + ordersTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Checkout - Room {booking.room?.roomNumber}
          </DialogTitle>
          <DialogDescription>
            Review the final bill and confirm checkout
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Guest Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Guest Name</p>
                  <p className="font-medium">
                    {booking.user
                      ? `${booking.user.firstName} ${booking.user.lastName}`
                      : "Unknown Guest"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-In</p>
                  <p className="font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-Out</p>
                  <p className="font-medium">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Charges */}
          <div>
            <h3 className="font-semibold mb-3">Room Charges</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Room {booking.room?.roomNumber} ({booking.room?.type})
                    </span>
                    <span>${(roomCharges / nights).toFixed(2)} / night</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{nights} night(s)</span>
                    <span className="font-semibold">${roomCharges.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders */}
          <div>
            <h3 className="font-semibold mb-3">
              Room Service & Orders ({orders.length})
            </h3>
            {loadingOrders ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No orders placed during stay
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium capitalize">{order.orderType}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.orderedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-sm font-semibold">
                            ${Number(order.totalPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1 pl-4 border-l-2 border-muted">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-muted-foreground">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Total Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Room Charges</span>
              <span>${roomCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Room Service & Orders</span>
              <span>${ordersTotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            disabled={loading || loadingOrders}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? "Processing..." : `Confirm & Pay $${finalTotal.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
