"use client";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import LocationSelector from "@/components/ui/location-input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useState } from "react";

export default function MyAdvocacyPage() {
  const firstname = useAuthStore((state) => state.firstname);
  const lastname = useAuthStore((state) => state.lastname);
  const email = useAuthStore((state) => state.email);
  const phone = useAuthStore((state) => state.phone);
  const locationRaw = useAuthStore((state) => state.location);
  const location = Array.isArray(locationRaw) ? locationRaw : [];
  const addr = useAuthStore((state) => state.addr);
  const city = useAuthStore((state) => state.city);
  const zip = useAuthStore((state) => state.zip);
  const interestRaw = useAuthStore((state) => state.interest);
  const interest = Array.isArray(interestRaw) ? interestRaw : [];
  const appliedAt = useAuthStore((state) => state.appliedAt);
  const acceptedAt = useAuthStore((state) => state.acceptedAt);
  const setUserData = useAuthStore((state) => state.setUserData);
  const { toast } = useToast();
  const [editMyAdvocacyOpen, setEditMyAdvocacyOpen] = useState(false);

  const queryClient = useQueryClient();
  const updateMyAdvocacyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/user/updateMyAdvocacy", data);
      return response.data;
    },
    onSuccess: async () => {
      toast({ title: "Success", description: "Your advocacy information has been updated." });
      setEditMyAdvocacyOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      try {
        const userResponse = await api.post("/api/user/getUser");
        if (userResponse.data?.message !== "Token is Invalid Or Expired") {
          setUserData(userResponse.data, true);
        }
      } catch (e) {
        console.error("Failed to refresh user:", e);
      }
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update",
        variant: "destructive",
      });
    },
  });

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return isNaN(date.getTime()) ? String(d) : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [editForm, setEditForm] = useState({
    firstname: firstname || "",
    lastname: lastname || "",
    addr: addr || "",
    city: city || "",
    zip: zip || "",
    location: location.length >= 2 ? location : location.length === 1 ? [location[0], ""] : ["", ""],
  });

  const handleEditOpen = () => {
    setEditForm({
      firstname: firstname || "",
      lastname: lastname || "",
      addr: addr || "",
      city: city || "",
      zip: zip || "",
      location: location.length >= 2 ? location : location.length === 1 ? [location[0], ""] : ["", ""],
    });
    setEditMyAdvocacyOpen(true);
  };

  const handleEditSubmit = () => {
    updateMyAdvocacyMutation.mutate({
      firstname: editForm.firstname,
      lastname: editForm.lastname,
      addr: editForm.addr,
      city: editForm.city,
      zip: editForm.zip,
      location: editForm.location,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0 h-full min-h-0 w-full">
      <div className="flex flex-1 flex-col gap-4 max-w-2xl">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-left py-2 sm:py-4">
          My Advocacy
        </h1>

        <div className="space-y-6">
          <Button onClick={handleEditOpen} variant="outline" size="sm" className="mb-2">
            <Edit className="h-4 w-4 mr-2" />
            Edit My Advocacy
          </Button>

          {/* Sign up / Accepted dates */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Application</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sign up date</p>
                <p className="text-base">{formatDate(appliedAt)}</p>
              </div>
              {acceptedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted date</p>
                  <p className="text-base">{formatDate(acceptedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-base">{firstname || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-base">{lastname || "Not provided"}</p>
              </div>
              <div className="opacity-60">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base text-muted-foreground">{email || "Not provided"}</p>
              </div>
              <div className="opacity-60">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base text-muted-foreground">{phone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Address</h3>
            <div className="space-y-2">
              {addr && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Street Address</p>
                  <p className="text-base">{addr}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {city && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-base">{city}</p>
                  </div>
                )}
                {location.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {location.length > 1 ? "State" : "Country"}
                    </p>
                    <p className="text-base">{location[location.length - 1] || location[0]}</p>
                  </div>
                )}
                {location.length > 1 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="text-base">{location[0]}</p>
                  </div>
                )}
                {zip && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ZIP Code</p>
                    <p className="text-base">{zip}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interests - greyed out */}
          {interest && interest.length > 0 && (
            <div className="opacity-60">
              <h3 className="font-semibold text-lg mb-2">Areas of Interest</h3>
              <div className="flex flex-wrap gap-2">
                {interest.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit My Advocacy Dialog */}
      <Dialog open={editMyAdvocacyOpen} onOpenChange={setEditMyAdvocacyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit My Advocacy</DialogTitle>
            <DialogDescription>
              Update your information. Email, phone, interests, and dates cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Read-only (greyed out) */}
            <div className="space-y-2 p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground">Email (cannot be changed)</p>
              <p className="text-base text-muted-foreground">{email || "—"}</p>
              <p className="text-sm font-medium text-muted-foreground mt-2">Phone (cannot be changed)</p>
              <p className="text-base text-muted-foreground">{phone || "—"}</p>
              <p className="text-sm font-medium text-muted-foreground mt-2">Sign up date</p>
              <p className="text-base text-muted-foreground">{formatDate(appliedAt)}</p>
              {interest?.length > 0 && (
                <>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Interests (cannot be changed)</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {interest.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded text-sm text-muted-foreground">{item}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={editForm.firstname}
                  onChange={(e) => setEditForm((p) => ({ ...p, firstname: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={editForm.lastname}
                  onChange={(e) => setEditForm((p) => ({ ...p, lastname: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Street Address</label>
              <Input
                value={editForm.addr}
                onChange={(e) => setEditForm((p) => ({ ...p, addr: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={editForm.zip}
                  onChange={(e) => setEditForm((p) => ({ ...p, zip: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location (Country & State)</label>
              <div className="mt-1">
                <LocationSelector
                  value={editForm.location}
                  onChange={(v) => setEditForm((p) => ({ ...p, location: v }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditMyAdvocacyOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={updateMyAdvocacyMutation.isPending || !editForm.firstname || !editForm.lastname}
              >
                {updateMyAdvocacyMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
