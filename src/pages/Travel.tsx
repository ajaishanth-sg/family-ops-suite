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
import { CalendarDays, MapPin, Plus, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TravelRequest {
  id: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  budget_amount: number;
  user_id: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TravelProps {
  userRole: string;
}

export function Travel({ userRole }: TravelProps) {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewRequest, setShowNewRequest] = useState(false);
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    title: "",
    destination: "",
    departure_date: "",
    return_date: "",
    purpose: "",
    budget_amount: ""
  });

  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const fetchTravelRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('travel_requests')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as TravelRequest[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch travel requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTravelRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('travel_requests')
        .insert([{
          ...newRequest,
          budget_amount: parseFloat(newRequest.budget_amount) || null,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Travel request created successfully"
      });

      setShowNewRequest(false);
      setNewRequest({
        title: "",
        destination: "",
        departure_date: "",
        return_date: "",
        purpose: "",
        budget_amount: ""
      });
      fetchTravelRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('travel_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${status} successfully`
      });
      fetchTravelRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || request.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const canManageRequests = userRole === "chairman" || userRole === "head-of-operations";

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Travel Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage travel requests and approvals
          </p>
        </div>
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Travel Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Business trip to Dubai"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={newRequest.destination}
                  onChange={(e) => setNewRequest({...newRequest, destination: e.target.value})}
                  placeholder="Dubai, UAE"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure">Departure</Label>
                  <Input
                    id="departure"
                    type="date"
                    value={newRequest.departure_date}
                    onChange={(e) => setNewRequest({...newRequest, departure_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="return">Return</Label>
                  <Input
                    id="return"
                    type="date"
                    value={newRequest.return_date}
                    onChange={(e) => setNewRequest({...newRequest, return_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="budget">Budget (OMR)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newRequest.budget_amount}
                  onChange={(e) => setNewRequest({...newRequest, budget_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({...newRequest, purpose: e.target.value})}
                  placeholder="Meeting with clients..."
                />
              </div>
              <Button onClick={createTravelRequest} className="w-full">
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search travel requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.profiles?.first_name} {request.profiles?.last_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {canManageRequests && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(request.departure_date).toLocaleDateString()} - {new Date(request.return_date).toLocaleDateString()}
                      </span>
                    </div>
                    {request.budget_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">OMR {request.budget_amount}</span>
                      </div>
                    )}
                  </div>
                  {request.purpose && (
                    <p className="text-sm text-muted-foreground mt-2">{request.purpose}</p>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No travel requests found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}