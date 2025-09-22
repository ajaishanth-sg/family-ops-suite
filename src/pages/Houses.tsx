import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, MapPin, Calendar, DollarSign, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  name: string;
  location: string;
  type: 'residential' | 'commercial' | 'office' | 'vacation';
  status: 'active' | 'maintenance' | 'renovation' | 'inactive';
  manager_id?: string;
  address?: string;
  size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  monthly_expenses?: number;
  last_inspection?: string;
  next_inspection?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface HousesProps {
  userRole: string;
}

export function Houses({ userRole }: HousesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewProperty, setShowNewProperty] = useState(false);
  const { toast } = useToast();

  const [newProperty, setNewProperty] = useState({
    name: "",
    location: "",
    type: "residential",
    address: "",
    size_sqft: "",
    bedrooms: "",
    bathrooms: "",
    monthly_expenses: "",
    amenities: ""
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data as Property[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async () => {
    try {
      const amenitiesArray = newProperty.amenities
        ? newProperty.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from('properties')
        .insert([{
          ...newProperty,
          size_sqft: newProperty.size_sqft ? parseInt(newProperty.size_sqft) : null,
          bedrooms: newProperty.bedrooms ? parseInt(newProperty.bedrooms) : null,
          bathrooms: newProperty.bathrooms ? parseInt(newProperty.bathrooms) : null,
          monthly_expenses: newProperty.monthly_expenses ? parseFloat(newProperty.monthly_expenses) : null,
          amenities: amenitiesArray.length > 0 ? amenitiesArray : null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property added successfully"
      });

      setShowNewProperty(false);
      setNewProperty({
        name: "",
        location: "",
        type: "residential",
        address: "",
        size_sqft: "",
        bedrooms: "",
        bathrooms: "",
        monthly_expenses: "",
        amenities: ""
      });
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updatePropertyStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property status updated"
      });
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || property.status === selectedTab || property.type === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      maintenance: "secondary",
      renovation: "destructive",
      inactive: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      residential: "default",
      commercial: "secondary",
      office: "outline",
      vacation: "destructive"
    } as const;

    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const isInspectionDue = (date?: string) => {
    if (!date) return false;
    const inspectionDate = new Date(date);
    const today = new Date();
    return inspectionDate <= today;
  };

  const canManageProperties = ["chairman", "house-manager-muscat", "head-of-operations"].includes(userRole);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">House Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage family office properties and maintenance
          </p>
        </div>
        {canManageProperties && (
          <Dialog open={showNewProperty} onOpenChange={setShowNewProperty}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                    placeholder="Main Residence"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                    placeholder="Muscat, Oman"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select
                    value={newProperty.type}
                    onValueChange={(value) => setNewProperty({...newProperty, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    placeholder="Full address..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="size">Size (sqft)</Label>
                    <Input
                      id="size"
                      type="number"
                      value={newProperty.size_sqft}
                      onChange={(e) => setNewProperty({...newProperty, size_sqft: e.target.value})}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({...newProperty, bedrooms: e.target.value})}
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({...newProperty, bathrooms: e.target.value})}
                      placeholder="3"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="monthly_expenses">Monthly Expenses (OMR)</Label>
                  <Input
                    id="monthly_expenses"
                    type="number"
                    value={newProperty.monthly_expenses}
                    onChange={(e) => setNewProperty({...newProperty, monthly_expenses: e.target.value})}
                    placeholder="1000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Textarea
                    id="amenities"
                    value={newProperty.amenities}
                    onChange={(e) => setNewProperty({...newProperty, amenities: e.target.value})}
                    placeholder="Swimming pool, Garden, Garage, Security system"
                  />
                </div>
                <Button onClick={createProperty} className="w-full">
                  Add Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.filter(p => p.status === 'maintenance').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              OMR {properties.reduce((sum, p) => sum + (p.monthly_expenses || 0), 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <Card key={property.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        <CardTitle className="text-lg">{property.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        {getStatusBadge(property.status)}
                        {getTypeBadge(property.type)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.address && (
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {property.size_sqft && (
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <div>{property.size_sqft.toLocaleString()} sqft</div>
                        </div>
                      )}
                      {property.bedrooms && (
                        <div>
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <div>{property.bedrooms}</div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div>
                          <span className="text-muted-foreground">Bathrooms:</span>
                          <div>{property.bathrooms}</div>
                        </div>
                      )}
                      {property.monthly_expenses && (
                        <div>
                          <span className="text-muted-foreground">Monthly:</span>
                          <div>OMR {property.monthly_expenses}</div>
                        </div>
                      )}
                    </div>

                    {property.manager_id && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Manager: {property.manager_id}</span>
                      </div>
                    )}

                    {property.next_inspection && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Next Inspection:</span>
                        <span className={isInspectionDue(property.next_inspection) ? "text-red-500" : ""}>
                          {new Date(property.next_inspection).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {canManageProperties && (
                      <div className="pt-2">
                        <Select
                          value={property.status}
                          onValueChange={(value) => updatePropertyStatus(property.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No properties found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}