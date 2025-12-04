"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { Calendar, User, Phone, MessageSquare, Trash2, Filter, CheckCircle, Clock } from "lucide-react";

export function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInquiries, setTotalInquiries] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Dialog state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadInquiries();
  }, [currentPage, statusFilter]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getInquiries(
        statusFilter || undefined,
        currentPage,
        10
      );
      setInquiries(response.data);
      setTotalPages(response.totalPages);
      setTotalInquiries(response.total);
      setError("");
    } catch (err: any) {
      console.error("Failed to load inquiries:", err);
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    const variants: Record<InquiryStatus, { variant: any; label: string; icon: any }> = {
      received: { variant: "outline", label: "Received", icon: Clock },
      addressed: { variant: "secondary", label: "Addressed", icon: CheckCircle },
    };
    return variants[status];
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    try {
      setLoadingAction(id);
      setError("");
      await apiClient.updateInquiryStatus(id, status);
      await loadInquiries();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      setLoadingAction(id);
      setError("");
      await apiClient.deleteInquiry(id);
      await loadInquiries();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete inquiry");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || "");
    setDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;

    try {
      setLoadingAction(selectedInquiry.id);
      await apiClient.updateInquiry(selectedInquiry.id, { notes });
      await loadInquiries();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save notes");
    } finally {
      setLoadingAction(null);
    }
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

  const handleClearFilters = () => {
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Guest Inquiries ({totalInquiries})</CardTitle>
          <CardDescription>Manage inquiries from potential guests via WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="addressed">Addressed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusFilter && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No inquiries found</p>
          ) : (
            <>
              <div className="space-y-4">
                {inquiries.map((inquiry) => {
                  const StatusIcon = getStatusBadge(inquiry.status).icon;
                  return (
                    <Card key={inquiry.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{inquiry.name}</h3>
                                <Badge
                                  variant={getStatusBadge(inquiry.status).variant}
                                  className="gap-1"
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {getStatusBadge(inquiry.status).label}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid gap-1.5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {inquiry.phoneNumber}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(inquiry.createdAt).toLocaleString()}
                              </div>
                            </div>

                            {/* Original Message */}
                            <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                              <div>
                                <p className="font-medium mb-1">Message:</p>
                                <p className="text-muted-foreground">{inquiry.message}</p>
                              </div>
                            </div>

                            {/* Translated Messages */}
                            {(inquiry.messageEnglish || inquiry.messageAmharic) && (
                              <div className="p-3 bg-primary/5 rounded-md text-sm space-y-2">
                                {inquiry.messageEnglish && inquiry.messageEnglish !== inquiry.message && (
                                  <div>
                                    <p className="font-medium mb-1">English Translation:</p>
                                    <p className="text-muted-foreground">{inquiry.messageEnglish}</p>
                                  </div>
                                )}
                                {inquiry.messageAmharic && inquiry.messageAmharic !== inquiry.message && (
                                  <div>
                                    <p className="font-medium mb-1">Amharic Translation (አማርኛ):</p>
                                    <p className="text-muted-foreground text-base" dir="rtl">
                                      {inquiry.messageAmharic}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {inquiry.notes && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                                <p className="font-medium mb-1">Notes:</p>
                                <p className="text-muted-foreground">{inquiry.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <Select
                              value={inquiry.status}
                              onValueChange={(value) => handleStatusChange(inquiry.id, value as InquiryStatus)}
                              disabled={loadingAction === inquiry.id}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="addressed">Addressed</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(inquiry)}
                              disabled={loadingAction === inquiry.id}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Notes
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(inquiry.id)}
                              disabled={loadingAction === inquiry.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
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
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
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

      {/* Notes Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Add notes or additional information about this inquiry
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{selectedInquiry.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInquiry.phoneNumber}</p>
                  </div>
                  <Badge variant={getStatusBadge(selectedInquiry.status).variant}>
                    {getStatusBadge(selectedInquiry.status).label}
                  </Badge>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Message:</p>
                  <p className="text-muted-foreground mt-1">{selectedInquiry.message}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or follow-up information..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={loadingAction === selectedInquiry?.id}>
              {loadingAction === selectedInquiry?.id ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
