"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface SimpleBooking {
  unitName: string;
  startDate: string;
  endDate: string;
}

interface BookingFormProps {
  onAddBooking: (booking: SimpleBooking) => void
}

export function BookingForm({ onAddBooking }: BookingFormProps) {
  const [unitName, setUnitName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!unitName || !startDate || !endDate) return

    onAddBooking({
      unitName,
      startDate,
      endDate,
    })

    setUnitName("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Create New Booking
        </CardTitle>
        <CardDescription>Book a unit for specific dates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitName">Unit Name</Label>
            <Input
              id="unitName"
              placeholder="e.g., Unit 101"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Booking
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
