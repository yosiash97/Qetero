"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Trash2 } from "lucide-react"
import type { OrderItem, Booking } from "@/app/page"

interface ItemsManagerProps {
  items: OrderItem[]
  bookings: Booking[]
  onAddItem: (item: Omit<OrderItem, "id" | "orderDate">) => void
  onDeleteItem: (id: string) => void
}

export function ItemsManager({ items, bookings, onAddItem, onDeleteItem }: ItemsManagerProps) {
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [itemName, setItemName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookingId || !itemName || !quantity || !price) return

    const selectedBooking = bookings.find((b) => b.id === selectedBookingId)
    if (!selectedBooking) return

    onAddItem({
      bookingId: selectedBookingId,
      roomNumber: selectedBooking.roomNumber,
      itemName,
      quantity: Number.parseInt(quantity),
      price: Number.parseFloat(price),
    })

    setItemName("")
    setQuantity("")
    setPrice("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const calculateTotal = (item: OrderItem) => {
    return (item.quantity * item.price).toFixed(2)
  }

  const activeBookings = bookings.filter((b) => b.status === "checked-in")

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Add Order Item
          </CardTitle>
          <CardDescription>Add items ordered by guests during their stay</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking">Select Guest / Room</Label>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId} required>
                <SelectTrigger id="booking">
                  <SelectValue placeholder="Choose a checked-in guest" />
                </SelectTrigger>
                <SelectContent>
                  {activeBookings.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No active bookings. Check in a guest first.</div>
                  ) : (
                    activeBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.guestName} - Room {booking.roomNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                placeholder="e.g., Towels, Cleaning Supplies"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={activeBookings.length === 0}>
              Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Order Items</CardTitle>
          <CardDescription>
            {items.length} {items.length === 1 ? "item" : "items"} ordered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No items ordered yet. Add your first item above.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-foreground">{item.itemName}</h3>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-primary">Room {item.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Qty: <span className="text-foreground">{item.quantity}</span>
                      </span>
                      <span>
                        Price: <span className="text-foreground">${item.price.toFixed(2)}</span>
                      </span>
                      <span>
                        Total: <span className="text-foreground font-medium">${calculateTotal(item)}</span>
                      </span>
                      <span className="text-xs">•</span>
                      <span className="text-xs">{formatDate(item.orderDate)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
