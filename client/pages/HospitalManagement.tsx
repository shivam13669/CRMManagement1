import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, MapPin, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HospitalManagement() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hospital_name: "",
    address: "",
    phone_number: "",
    hospital_type: "General",
    license_number: "",
    number_of_ambulances: "0",
    number_of_beds: "0",
    departments: "",
    google_map_enabled: false,
    google_map_link: "",
    full_name: "",
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/hospitals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
      toast({
        title: "Error",
        description: "Failed to load hospitals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as any).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.hospital_name ||
        !formData.address ||
        !formData.full_name
      ) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/hospitals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          number_of_ambulances: parseInt(formData.number_of_ambulances),
          number_of_beds: parseInt(formData.number_of_beds),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Hospital "${formData.hospital_name}" created successfully!`,
        });

        // Reset form
        setFormData({
          username: "",
          email: "",
          password: "",
          hospital_name: "",
          address: "",
          phone_number: "",
          hospital_type: "General",
          license_number: "",
          number_of_ambulances: "0",
          number_of_beds: "0",
          departments: "",
          google_map_enabled: false,
          google_map_link: "",
          full_name: "",
        });

        setShowCreateForm(false);
        fetchHospitals();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create hospital",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating hospital:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hospital Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage hospital accounts
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Hospital
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Hospital Account</CardTitle>
            <CardDescription>
              Fill in the hospital details below. The hospital admin can later
              update additional information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Admin Account Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Administrator Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Administrator Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Hospital Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hospital Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospital_name">Hospital Name *</Label>
                    <Input
                      id="hospital_name"
                      name="hospital_name"
                      type="text"
                      placeholder="City General Hospital"
                      value={formData.hospital_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hospital_type">Hospital Type *</Label>
                    <Select
                      value={formData.hospital_type}
                      onValueChange={(value) =>
                        handleSelectChange("hospital_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Specialty">Specialty</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Medical Street, City, State 12345"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">
                      Contact Phone Number
                    </Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="1234567890"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      type="text"
                      placeholder="LIC123456"
                      value={formData.license_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_ambulances">
                      Number of Ambulances
                    </Label>
                    <Input
                      id="number_of_ambulances"
                      name="number_of_ambulances"
                      type="number"
                      placeholder="0"
                      value={formData.number_of_ambulances}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_beds">Number of Beds</Label>
                    <Input
                      id="number_of_beds"
                      name="number_of_beds"
                      type="number"
                      placeholder="0"
                      value={formData.number_of_beds}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="departments">
                      Departments (comma-separated)
                    </Label>
                    <Input
                      id="departments"
                      name="departments"
                      type="text"
                      placeholder="Cardiology, Orthopedics, Pediatrics"
                      value={formData.departments}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Google Map Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Google Map Integration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="google_map_enabled"
                      name="google_map_enabled"
                      checked={formData.google_map_enabled}
                      onChange={handleChange}
                    />
                    <Label htmlFor="google_map_enabled" className="cursor-pointer">
                      Enable Google Map Location
                    </Label>
                  </div>

                  {formData.google_map_enabled && (
                    <div>
                      <Label htmlFor="google_map_link">
                        Google Map Link
                      </Label>
                      <Input
                        id="google_map_link"
                        name="google_map_link"
                        type="url"
                        placeholder="https://www.google.com/maps/..."
                        value={formData.google_map_link}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        When enabled, a "View Map" button will appear on the
                        hospital dashboard that opens this link.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Creating..." : "Create Hospital"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Hospitals List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Hospital Accounts ({hospitals.length})
        </h2>

        {loading && !hospitals.length ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading hospitals...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No hospital accounts created yet.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create First Hospital
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {hospital.hospital_name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            hospital.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {hospital.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{hospital.phone_number || "N/A"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-semibold text-sm">
                            {hospital.hospital_type || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ambulances</p>
                          <p className="font-semibold text-sm">
                            {hospital.number_of_ambulances || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Beds</p>
                          <p className="font-semibold text-sm">
                            {hospital.number_of_beds || 0}
                          </p>
                        </div>
                      </div>

                      {hospital.google_map_enabled && hospital.google_map_link && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            onClick={() =>
                              window.open(hospital.google_map_link, "_blank")
                            }
                            variant="outline"
                            size="sm"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            View Location
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500">Admin Email</p>
                      <p className="text-sm font-medium">{hospital.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
