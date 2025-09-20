import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Check, X, Clock, DollarSign, Plane, Car, Home } from "lucide-react";

const approvalData = [
  {
    id: "APR-2024-001",
    type: "expense",
    title: "Office Renovation Expenses",
    amount: "OMR 12,500.00",
    requestedBy: "Executive Assistant",
    department: "Operations",
    date: "2024-01-15",
    status: "pending",
    priority: "high",
    description: "Renovation of main office space including furniture and equipment",
    icon: Home,
  },
  {
    id: "APR-2024-002", 
    type: "travel",
    title: "Business Travel - London",
    amount: "OMR 3,200.00",
    requestedBy: "Financial Adviser",
    department: "Finance",
    date: "2024-01-14",
    status: "pending",
    priority: "medium",
    description: "International business trip for investment meetings",
    icon: Plane,
  },
  {
    id: "APR-2024-003",
    type: "fleet",
    title: "Vehicle Maintenance",
    amount: "OMR 850.00",
    requestedBy: "Fleet Manager",
    department: "Operations",
    date: "2024-01-13",
    status: "approved",
    priority: "low",
    description: "Routine maintenance for company vehicles",
    icon: Car,
  },
  {
    id: "APR-2024-004",
    type: "expense",
    title: "Marketing Campaign",
    amount: "OMR 5,600.00",
    requestedBy: "Marketing Manager",
    department: "Marketing",
    date: "2024-01-12",
    status: "rejected",
    priority: "medium",
    description: "Digital marketing campaign for Q1",
    icon: DollarSign,
  },
  {
    id: "APR-2024-005",
    type: "travel",
    title: "Team Training - Dubai",
    amount: "OMR 2,400.00",
    requestedBy: "HR Manager",
    department: "Human Resources",
    date: "2024-01-11",
    status: "pending",
    priority: "medium",
    description: "Staff training and development program",
    icon: Plane,
  },
];

interface ApprovalsProps {
  userRole: string;
}

export function Approvals({ userRole }: ApprovalsProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApprovals = approvalData.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || approval.status === statusFilter;
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "pending" && approval.status === "pending") ||
                      (selectedTab === "approved" && approval.status === "approved") ||
                      (selectedTab === "rejected" && approval.status === "rejected");
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="status-approved">Approved</Badge>;
      case "pending":
        return <Badge className="status-pending">Pending</Badge>;
      case "rejected":
        return <Badge className="status-rejected">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-danger";
      case "medium":  
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const handleApprove = (id: string) => {
    console.log("Approved:", id);
    // In a real app, this would update the approval status
  };

  const handleReject = (id: string) => {
    console.log("Rejected:", id);
    // In a real app, this would update the approval status
  };

  const canApprove = (approval: any) => {
    if (userRole === "hoo") return true;
    if (userRole === "fa" && approval.type !== "finance") return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approval Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and process approval requests across the organization
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending ({approvalData.filter(a => a.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No approvals found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredApprovals.map((approval) => (
              <Card key={approval.id} className="dashboard-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-muted">
                        <approval.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{approval.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Requested by {approval.requestedBy} • {approval.department}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">ID: {approval.id}</span>
                          <span className="text-sm text-muted-foreground">Date: {approval.date}</span>
                          <span className={`text-sm font-medium capitalize ${getPriorityColor(approval.priority)}`}>
                            {approval.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-primary">{approval.amount}</span>
                      {getStatusBadge(approval.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{approval.description}</p>
                  
                  {approval.status === "pending" && canApprove(approval) && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(approval.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject(approval.id)}
                        className="border-danger text-danger hover:bg-danger hover:text-danger-foreground"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                  
                  {approval.status !== "pending" && (
                    <div className="flex justify-end">
                      <Button variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}