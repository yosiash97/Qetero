"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { Maintenance, MaintenanceStatus, MaintenanceCategory, MaintenancePriority } from "@/lib/types";
import { Calendar, User, Phone, Wrench, AlertCircle, CheckCircle, Clock, Trash2, Filter } from "lucide-react";

export function MaintenanceList() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    loadMaintenanceRequests();
  }, [currentPage, priorityFilter, categoryFilter]);

  const loadMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMaintenanceRequests(
        undefined,
        priorityFilter || undefined,
        categoryFilter || undefined,
        currentPage,
        10
      );
      setMaintenanceRequests(response.data);
      setTotalPages(response.totalPages);
      setTotalRequests(response.total);
      setError("");
    } catch (err: any) {
      console.error("Failed to load maintenance requests:", err);
      setError("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    const variants: Record<MaintenanceStatus, { variant: any; label: string; icon: any }> = {
      pending: { variant: "outline", label: "Pending", icon: Clock },
      in_progress: { variant: "default", label: "In Progress", icon: Wrench },
      resolved: { variant: "secondary", label: "Resolved", icon: CheckCircle },
      closed: { variant: "outline", label: "Closed", icon: CheckCircle },
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    const variants: Record<MaintenancePriority, { variant: any; label: string }> = {
      low: { variant: "outline", label: "Low" },
      medium: { variant: "secondary", label: "Medium" },
      high: { variant: "default", label: "High" },
      urgent: { variant: "destructive", label: "Urgent" },
    };
    return variants[priority];
  };

  const getCategoryLabel = (category: MaintenanceCategory) => {
    const labels: Record<MaintenanceCategory, string> = {
      hvac: "HVAC",
      plumbing: "Plumbing",
      electrical: "Electrical",
      furniture: "Furniture",
      cleaning: "Cleaning",
      appliances: "Appliances",
      other: "Other",
    };
    return labels[category];
  };

  const handleStatusChange = async (id: string, status: MaintenanceStatus) => {
    try {
      setLoadingAction(id);
      setError("");
      await apiClient.updateMaintenanceStatus(id, status);
      await loadMaintenanceRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance request?")) return;

    try {
      setLoadingAction(id);
      setError("");
      await apiClient.deleteMaintenanceRequest(id);
      await loadMaintenanceRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete request");
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
    setPriorityFilter("");
    setCategoryFilter("");
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Requests ({totalRequests})</CardTitle>
        <CardDescription>Manage guest maintenance requests from WhatsApp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Select value={priorityFilter || undefined} onValueChange={(value) => setPriorityFilter(value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Select value={categoryFilter || undefined} onValueChange={(value) => setCategoryFilter(value || "")}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="appliances">Appliances</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(priorityFilter || categoryFilter) && (
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
            <p className="mt-4 text-sm text-muted-foreground">Loading requests...</p>
          </div>
        ) : maintenanceRequests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No maintenance requests found</p>
        ) : (
          <>
            <div className="space-y-4">
              {maintenanceRequests.map((request) => {
                const StatusIcon = getStatusBadge(request.status).icon;
                return (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{request.description}</h3>
                              <Badge variant={getPriorityBadge(request.priority).variant}>
                                {getPriorityBadge(request.priority).label}
                              </Badge>
                              <Badge variant="outline">{getCategoryLabel(request.category)}</Badge>
                            </div>
                            {request.descriptionAmharic && (
                              <p className="text-lg font-medium text-primary" dir="rtl">
                                {request.descriptionAmharic}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-1.5 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {request.user
                                ? `${request.user.firstName} ${request.user.lastName}`
                                : "Unknown Guest"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              Room: {request.room?.roomNumber || "N/A"}
                            </div>
                            {request.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {request.phoneNumber}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.createdAt).toLocaleString()}
                            </div>
                          </div>

                          {request.originalMessage && (
                            <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                              <div>
                                <p className="font-medium mb-1">Original Message:</p>
                                <p className="text-muted-foreground">{request.originalMessage}</p>
                              </div>
                              {request.originalMessageAmharic && (
                                <div>
                                  <p className="font-medium mb-1">የመጀመሪያ መልእክት (Amharic):</p>
                                  <p className="text-muted-foreground text-base" dir="rtl">
                                    {request.originalMessageAmharic}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getStatusBadge(request.status).variant}
                              className="gap-1"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {getStatusBadge(request.status).label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <Select
                            value={request.status}
                            onValueChange={(value) => handleStatusChange(request.id, value as MaintenanceStatus)}
                            disabled={loadingAction === request.id}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(request.id)}
                            disabled={loadingAction === request.id}
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
  );
}
