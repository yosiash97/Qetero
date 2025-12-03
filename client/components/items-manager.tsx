"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { Order, Booking, OrderType, OrderStatus, OrderItem } from "@/lib/types";
import { Package, Plus, Trash2, Check } from "lucide-react";

type ItemsManagerProps = {
  orders: Order[];
  bookings: Booking[];
  onRefresh: () => void;
};

export function ItemsManager({ orders, bookings, onRefresh }: ItemsManagerProps) {
  const [selectedBooking, setSelectedBooking] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.FOOD);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkedInBookings = bookings.filter((b) => b.status === "checked_in");

  const addItem = () => {
    if (!itemName || quantity <= 0 || price <= 0) {
      alert("Please fill in all item details");
      return;
    }

    setItems([...items, { name: itemName, quantity, price }]);
    setItemName("");
    setQuantity(1);
    setPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (!selectedBooking || items.length === 0) {
      alert("Please select a booking and add at least one item");
      return;
    }

    const booking = bookings.find((b) => b.id === selectedBooking);
    if (!booking) return;

    try {
      setLoading(true);
      setError("");

      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await apiClient.createOrder({
        bookingId: booking.id,
        roomId: booking.roomId,
        orderType,
        items,
        totalPrice,
      });

      alert("Order created successfully!");
      setSelectedBooking("");
      setItems([]);
      setOrderType(OrderType.FOOD);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiClient.updateOrderStatus(orderId, status);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update order status");
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { variant: any; label: string }> = {
      [OrderStatus.PENDING]: { variant: "outline", label: "Pending" },
      [OrderStatus.CONFIRMED]: { variant: "secondary", label: "Confirmed" },
      [OrderStatus.PREPARING]: { variant: "default", label: "Preparing" },
      [OrderStatus.READY]: { variant: "default", label: "Ready" },
      [OrderStatus.DELIVERED]: { variant: "outline", label: "Delivered" },
      [OrderStatus.CANCELLED]: { variant: "destructive", label: "Cancelled" },
    };
    return variants[status];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>Place orders for checked-in guests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Booking ({checkedInBookings.length} checked-in)</Label>
            <Select value={selectedBooking} onValueChange={setSelectedBooking} disabled={checkedInBookings.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={
                  checkedInBookings.length === 0
                    ? "No checked-in bookings available"
                    : "Choose a checked-in booking"
                } />
              </SelectTrigger>
              <SelectContent>
                {checkedInBookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    Room {booking.room?.roomNumber} -{" "}
                    {booking.user
                      ? `${booking.user.firstName} ${booking.user.lastName}`
                      : "Unknown Guest"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {checkedInBookings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Please check in a guest first before creating orders
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="combo">Combo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-end">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Burger"
              />
            </div>
            <div className="space-y-2">
              <Label>Qty</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <Button onClick={addItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <Label>Order Items</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x ${Number(item.price).toFixed(2)} = ${(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="font-semibold">
                    Total: ${items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleCreateOrder} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
          <CardDescription>Manage room service orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">
                            Room {order.room?.roomNumber || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.orderedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge {...getStatusBadge(order.status)} variant={getStatusBadge(order.status).variant}>
                          {getStatusBadge(order.status).label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm">
                            {item.quantity}x {item.name} - ${Number(item.price).toFixed(2)}
                          </p>
                        ))}
                        <p className="font-semibold">Total: ${Number(order.totalPrice).toFixed(2)}</p>
                      </div>
                      {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                        <div className="flex gap-2">
                          {order.status === OrderStatus.PENDING && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.CONFIRMED)}
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === OrderStatus.CONFIRMED && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.PREPARING)}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === OrderStatus.PREPARING && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.READY)}
                            >
                              Mark Ready
                            </Button>
                          )}
                          {order.status === OrderStatus.READY && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Delivered
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
