"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GuestForm } from "@/components/guest-form"
import { Search, Bed, Crown, DollarSign } from "lucide-react"
import type { Room, Booking, Guest } from "@/app/page"

type RoomAvailabilityProps = {
  rooms: Room[]
  bookings: Booking[]
  onCreateBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => void
}

export function RoomAvailability({ rooms, bookings, onCreateBooking }: RoomAvailabilityProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<{
    type: ("studio" | "one-bed" | "two-bed")[]
    category: ("standard" | "luxury")[]
  }>({
    type: [],
    category: [],
  })
  const [showResults, setShowResults] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [newGuest, setNewGuest] = useState<Guest | null>(null)

  const toggleFilter = (filterType: "type" | "category", value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[filterType]
      const updated = current.includes(value as never)
        ? current.filter((v) => v !== value)
        : [...current, value as never]
      return { ...prev, [filterType]: updated }
    })
  }

  const getAvailableRooms = () => {
    if (!checkIn || !checkOut) return []

    const filtered = rooms.filter((room) => {
      // Check filters
      if (selectedFilters.type.length > 0 && !selectedFilters.type.includes(room.type)) {
        return false
      }
      if (selectedFilters.category.length > 0 && !selectedFilters.category.includes(room.category)) {
        return false
      }

      // Check availability
      const isBooked = bookings.some((booking) => {
        if (booking.roomId !== room.id) return false

        const bookingCheckIn = new Date(booking.checkIn)
        const bookingCheckOut = new Date(booking.checkOut)
        const searchCheckIn = new Date(checkIn)
        const searchCheckOut = new Date(checkOut)

        // Check for overlap
        return searchCheckIn < bookingCheckOut && searchCheckOut > bookingCheckIn
      })

      return !isBooked
    })

    return filtered
  }

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates")
      return
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date must be after check-in date")
      return
    }
    setShowResults(true)
    setSelectedRoom(null)
    setNewGuest(null)
  }

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleGuestCreated = (guest: Guest) => {
    setNewGuest(guest)
  }

  const handleConfirmBooking = () => {
    if (!selectedRoom || !newGuest) return

    onCreateBooking({
      guestId: newGuest.id,
      guestName: newGuest.name,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.number,
      checkIn,
      checkOut,
    })

    // Reset
    setCheckIn("")
    setCheckOut("")
    setSelectedFilters({ type: [], category: [] })
    setShowResults(false)
    setSelectedRoom(null)
    setNewGuest(null)
    alert("Booking created successfully!")
  }

  const availableRooms = getAvailableRooms()

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Available Rooms</CardTitle>
          <CardDescription>Enter guest check-in dates and filter by room type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Inputs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-In Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-Out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Room Type</Label>
              <div className="flex flex-wrap gap-2">
                {["studio", "one-bed", "two-bed"].map((type) => (
                  <Badge
                    key={type}
                    variant={selectedFilters.type.includes(type as never) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("type", type)}
                  >
                    {type === "one-bed" ? "One Bed" : type === "two-bed" ? "Two Bed" : "Studio"}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                {["standard", "luxury"].map((category) => (
                  <Badge
                    key={category}
                    variant={selectedFilters.category.includes(category as never) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("category", category)}
                  >
                    {category === "luxury" ? "Luxury" : "Standard"}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full md:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Rooms
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms ({availableRooms.length})</CardTitle>
            <CardDescription>
              {checkIn &&
                checkOut &&
                `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No rooms available for selected dates</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableRooms.map((room) => (
                  <Card
                    key={room.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom?.id === room.id ? "border-primary ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Room {room.number}</h3>
                          {room.category === "luxury" && <Crown className="h-5 w-5 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bed className="h-4 w-4" />
                          {room.type === "one-bed" ? "One Bed" : room.type === "two-bed" ? "Two Bed" : "Studio"}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">${room.price}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </div>
                        <Badge variant={room.category === "luxury" ? "default" : "secondary"}>{room.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guest Form */}
      {selectedRoom && !newGuest && (
        <Card>
          <CardHeader>
            <CardTitle>Create Guest Profile</CardTitle>
            <CardDescription>Enter guest information from their ID</CardDescription>
          </CardHeader>
          <CardContent>
            <GuestForm onGuestCreated={handleGuestCreated} />
          </CardContent>
        </Card>
      )}

      {/* Confirmation */}
      {selectedRoom && newGuest && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Confirm Booking</CardTitle>
            <CardDescription>Review details before confirming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Guest</Label>
                <p className="font-medium">{newGuest.name}</p>
                <p className="text-sm text-muted-foreground">{newGuest.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Room</Label>
                <p className="font-medium">Room {selectedRoom.number}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoom.type === "one-bed" ? "One Bed" : selectedRoom.type === "two-bed" ? "Two Bed" : "Studio"}{" "}
                  - {selectedRoom.category}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Check-In</Label>
                <p className="font-medium">{new Date(checkIn).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Check-Out</Label>
                <p className="font-medium">{new Date(checkOut).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmBooking} className="flex-1">
                Confirm Booking
              </Button>
              <Button variant="outline" onClick={() => setNewGuest(null)}>
                Edit Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
