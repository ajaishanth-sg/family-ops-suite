import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Plus, Calendar, AlertTriangle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  driver_assigned?: string;
  last_service_date?: string;
  next_service_date?: string;
  mileage: number;
  fuel_type?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface FleetProps {
  userRole: string;
}

export function Fleet({ userRole }: FleetProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewVehicle, setShowNewVehicle] = useState(false);
  const { toast } = useToast();

  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: "",
    license_plate: "",
    vin: "",
    fuel_type: "",
    mileage: "",
    insurance_expiry: "",
    registration_expiry: ""
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles((data as Vehicle[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async () => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([{
          ...newVehicle,
          year: parseInt(newVehicle.year),
          mileage: parseInt(newVehicle.mileage) || 0,
          insurance_expiry: newVehicle.insurance_expiry || null,
          registration_expiry: newVehicle.registration_expiry || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully"
      });

      setShowNewVehicle(false);
      setNewVehicle({
        make: "",
        model: "",
        year: "",
        license_plate: "",
        vin: "",
        fuel_type: "",
        mileage: "",
        insurance_expiry: "",
        registration_expiry: ""
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateVehicleStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle status updated"
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || vehicle.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      "in-use": "secondary",
      maintenance: "destructive",
      retired: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const canManageFleet = ["chairman", "fleet-manager", "head-of-operations"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage company vehicles and assignments
          </p>
        </div>
        {canManageFleet && (
          <Dialog open={showNewVehicle} onOpenChange={setShowNewVehicle}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      placeholder="Camry"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={newVehicle.mileage}
                      onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input
                    id="license_plate"
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN (Optional)</Label>
                  <Input
                    id="vin"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select
                    value={newVehicle.fuel_type}
                    onValueChange={(value) => setNewVehicle({...newVehicle, fuel_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                    <Input
                      id="insurance_expiry"
                      type="date"
                      value={newVehicle.insurance_expiry}
                      onChange={(e) => setNewVehicle({...newVehicle, insurance_expiry: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_expiry">Registration Expiry</Label>
                    <Input
                      id="registration_expiry"
                      type="date"
                      value={newVehicle.registration_expiry}
                      onChange={(e) => setNewVehicle({...newVehicle, registration_expiry: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={createVehicle} className="w-full">
                  Add Vehicle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'in-use').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="in-use">In Use</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        <CardTitle className="text-lg">
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} • {vehicle.license_plate}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mileage:</span>
                        <div>{vehicle.mileage.toLocaleString()} km</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fuel:</span>
                        <div>{vehicle.fuel_type || 'N/A'}</div>
                      </div>
                    </div>

                    {vehicle.profiles && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.profiles.first_name} {vehicle.profiles.last_name}</span>
                      </div>
                    )}

                    {(vehicle.insurance_expiry || vehicle.registration_expiry) && (
                      <div className="space-y-1">
                        {vehicle.insurance_expiry && (
                          <div className="flex items-center gap-2 text-xs">
                            {(isExpired(vehicle.insurance_expiry) || isExpiringSoon(vehicle.insurance_expiry)) && (
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-muted-foreground">Insurance:</span>
                            <span className={isExpired(vehicle.insurance_expiry) ? "text-red-500" : 
                                           isExpiringSoon(vehicle.insurance_expiry) ? "text-orange-500" : ""}>
                              {new Date(vehicle.insurance_expiry).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {vehicle.registration_expiry && (
                          <div className="flex items-center gap-2 text-xs">
                            {(isExpired(vehicle.registration_expiry) || isExpiringSoon(vehicle.registration_expiry)) && (
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="text-muted-foreground">Registration:</span>
                            <span className={isExpired(vehicle.registration_expiry) ? "text-red-500" : 
                                           isExpiringSoon(vehicle.registration_expiry) ? "text-orange-500" : ""}>
                              {new Date(vehicle.registration_expiry).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {canManageFleet && (
                      <div className="flex gap-2 pt-2">
                        <Select
                          value={vehicle.status}
                          onValueChange={(value) => updateVehicleStatus(vehicle.id, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="in-use">In Use</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vehicles found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}