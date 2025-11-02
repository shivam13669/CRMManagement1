import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, MapPin, Phone, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HospitalItem {
  id: number;
  user_id: number;
  hospital_name: string;
  address: string;
  phone_number?: string | null;
  hospital_type?: string | null;
  license_number?: string | null;
  number_of_ambulances?: number | null;
  number_of_beds?: number | null;
  departments?: string | null;
  google_map_enabled?: number | boolean;
  google_map_link?: string | null;
  status?: string;
  email: string;
}

export default function HospitalManagement() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospital_name: "",
    address: "",
    hospital_type: "General",
    license_number: "",
    number_of_ambulances: "0",
    number_of_beds: "0",
    departments: "",
    location_enabled: false,
    location_link: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [contactNumberInput, setContactNumberInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState<string[]>([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/hospitals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals((data.hospitals || []) as HospitalItem[]);
      } else {
        throw new Error("Failed to load hospitals");
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
      toast({ title: "Error", description: "Failed to load hospitals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addContactNumber = () => {
    const digits = contactNumberInput.replace(/[^0-9]/g, "").trim();
    if (!digits) return;
    const formatted = `${countryCode} ${digits}`;
    setContactNumbers((prev) => Array.from(new Set([...prev, formatted])));
    setContactNumberInput("");
  };

  const removeContactNumber = (num: string) => {
    setContactNumbers((prev) => prev.filter((n) => n !== num));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!formData.full_name || !formData.email || !formData.password || !formData.hospital_name || !formData.address) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/hospitals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          hospital_name: formData.hospital_name,
          address: formData.address,
          phone_number: contactNumbers.join(","),
          hospital_type: formData.hospital_type,
          license_number: formData.license_number || undefined,
          number_of_ambulances: parseInt(formData.number_of_ambulances || "0", 10),
          number_of_beds: parseInt(formData.number_of_beds || "0", 10),
          departments: formData.departments || undefined,
          google_map_enabled: formData.location_enabled,
          google_map_link: formData.location_enabled ? formData.location_link : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Error", description: data.error || "Failed to create hospital", variant: "destructive" });
        return;
      }

      toast({ title: "Hospital created", description: `\"${formData.hospital_name}\" created successfully!` });

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        hospital_name: "",
        address: "",
        hospital_type: "General",
        license_number: "",
        number_of_ambulances: "0",
        number_of_beds: "0",
        departments: "",
        location_enabled: false,
        location_link: "",
      });
      setCountryCode("+91");
      setContactNumbers([]);
      setContactNumberInput("");
      setShowCreateForm(false);
      fetchHospitals();
    } catch (error) {
      console.error("Error creating hospital:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hospitalsWithPhones = useMemo(() => {
    return hospitals.map((h) => ({
      ...h,
      phoneList: (h.phone_number || "").split(",").map((s) => s.trim()).filter(Boolean),
    }));
  }, [hospitals]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-600 mt-2">Create and manage hospital accounts</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogDescription>
                  Admin-only creation. The hospital will log in using the email and password you set here.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Admin Account Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Administrator Name *</Label>
                      <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="admin@hospital.com" required />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" required />
                    </div>
                  </div>
                </div>

                {/* Hospital Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital_name">Hospital Name *</Label>
                      <Input id="hospital_name" value={formData.hospital_name} onChange={(e) => setFormData((p) => ({ ...p, hospital_name: e.target.value }))} placeholder="City General Hospital" required />
                    </div>
                    <div>
                      <Label htmlFor="hospital_type">Hospital Type *</Label>
                      <Select value={formData.hospital_type} onValueChange={(value) => setFormData((p) => ({ ...p, hospital_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                      <Input id="address" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} placeholder="123 Medical Street, City, State 12345" required />
                    </div>

                    {/* Contact numbers */}
                    <div className="md:col-span-2">
                      <Label>Hospital Contact number(s)</Label>
                      <div className="flex gap-2 mt-1">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+971">+971</SelectItem>
                            <SelectItem value="+92">+92</SelectItem>
                            <SelectItem value="+880">+880</SelectItem>
                            <SelectItem value="+977">+977</SelectItem>
                            <SelectItem value="+94">+94</SelectItem>
                            <SelectItem value="+61">+61</SelectItem>
                            <SelectItem value="+81">+81</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          value={contactNumberInput}
                          onChange={(e) => setContactNumberInput(e.target.value)}
                        />
                        <Button type="button" variant="secondary" onClick={addContactNumber}>
                          Add
                        </Button>
                      </div>
                      {contactNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contactNumbers.map((num) => (
                            <span key={num} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <Phone className="w-3 h-3" />
                              {num}
                              <button type="button" onClick={() => removeContactNumber(num)} aria-label={`Remove ${num}`}>
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="number_of_ambulances">Numbers of ambulance</Label>
                      <Input id="number_of_ambulances" type="number" value={formData.number_of_ambulances} onChange={(e) => setFormData((p) => ({ ...p, number_of_ambulances: e.target.value }))} placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="number_of_beds">Numbers of beds</Label>
                      <Input id="number_of_beds" type="number" value={formData.number_of_beds} onChange={(e) => setFormData((p) => ({ ...p, number_of_beds: e.target.value }))} placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="license_number">License/registration number</Label>
                      <Input id="license_number" value={formData.license_number} onChange={(e) => setFormData((p) => ({ ...p, license_number: e.target.value }))} placeholder="LIC123456" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="departments">Departments</Label>
                      <Input id="departments" value={formData.departments} onChange={(e) => setFormData((p) => ({ ...p, departments: e.target.value }))} placeholder="Cardiology, Orthopedics, Pediatrics" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="location_enabled"
                        checked={formData.location_enabled}
                        onCheckedChange={(checked) => setFormData((p) => ({ ...p, location_enabled: Boolean(checked) }))}
                      />
                      <Label htmlFor="location_enabled" className="cursor-pointer">Enable location link</Label>
                    </div>

                    {formData.location_enabled && (
                      <div>
                        <Label htmlFor="location_link">Location URL</Label>
                        <Input id="location_link" type="url" placeholder="Paste any map/location link" value={formData.location_link} onChange={(e) => setFormData((p) => ({ ...p, location_link: e.target.value }))} />
                        <p className="text-xs text-gray-500 mt-2">This can be any URL (e.g., Google Maps). A "Show Location" button will open it in a new tab.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="min-w-[120px]">
                    {loading ? "Creating..." : "Create Hospital"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hospitals List */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Hospital Accounts ({hospitals.length})</h2>

          {loading && !hospitals.length ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading hospitals...</p>
                </div>
              </CardContent>
            </Card>
          ) : hospitals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No hospital accounts created yet.</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Hospital
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {hospitalsWithPhones.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{hospital.hospital_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${hospital.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {hospital.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{hospital.address}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Phone className="w-4 h-4" />
                            {hospital.phoneList && hospital.phoneList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {hospital.phoneList.map((n) => (
                                  <span key={n} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border">{n}</span>
                                ))}
                              </div>
                            ) : (
                              <span>N/A</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-semibold text-sm">{hospital.hospital_type || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ambulances</p>
                            <p className="font-semibold text-sm">{hospital.number_of_ambulances || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Beds</p>
                            <p className="font-semibold text-sm">{hospital.number_of_beds || 0}</p>
                          </div>
                        </div>

                        {hospital.google_map_enabled && hospital.google_map_link && (
                          <div className="mt-4 pt-4 border-t">
                            <Button onClick={() => window.open(hospital.google_map_link!, "_blank")} variant="outline" size="sm">
                              <MapPin className="w-4 h-4 mr-2" />
                              Show Location
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
    </Layout>
  );
}
