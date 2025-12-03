"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, User, DoorOpen } from "lucide-react"
import type { Booking } from "@/app/page"

interface BookingsListProps {
  bookings: Booking[]
  onDeleteBooking: (id: string) => void
}

export function BookingsList({ bookings, onDeleteBooking }: BookingsListProps) {
  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "checked-in":
        return "bg-primary/20 text-primary border-primary/30"
      case "upcoming":
        return "bg-muted text-muted-foreground border-border"
      case "checked-out":
        return "bg-accent text-accent-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No bookings yet. Create your first booking in the Check-In tab.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">{booking.guestName}</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Room {booking.roomNumber}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteBooking(booking.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
