import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, DollarSign, Calendar, Building, Receipt, Car, Home, Plane } from "lucide-react";

const expenseData = [
  {
    id: "EXP-2024-001",
    title: "Office Supplies",
    amount: "OMR 125.50",
    category: "Office",
    department: "Operations",
    date: "2024-01-15",
    status: "approved",
    submittedBy: "John Smith",
    description: "Monthly office supplies including stationery and equipment",
    receiptUrl: "#",
    icon: Building,
  },
  {
    id: "EXP-2024-002",
    title: "Fuel - Company Vehicle",
    amount: "OMR 85.75",
    category: "Fleet",
    department: "Fleet Management",
    date: "2024-01-14", 
    status: "pending",
    submittedBy: "Ahmed Al-Rashid",
    description: "Fuel expenses for company vehicle registration ABC-123",
    receiptUrl: "#",
    icon: Car,
  },
  {
    id: "EXP-2024-003",
    title: "House Maintenance",
    amount: "OMR 450.00",
    category: "House",
    department: "House Management",
    date: "2024-01-13",
    status: "approved",
    submittedBy: "Maria Santos",
    description: "Plumbing repairs and maintenance work at Muscat residence",
    receiptUrl: "#",
    icon: Home,
  },
  {
    id: "EXP-2024-004",
    title: "Business Travel - Dubai",
    amount: "OMR 1,200.00",
    category: "Travel",
    department: "Finance",
    date: "2024-01-12",
    status: "pending",
    submittedBy: "Sarah Wilson",
    description: "Business trip expenses including flight and accommodation",
    receiptUrl: "#",
    icon: Plane,
  },
  {
    id: "EXP-2024-005",
    title: "Grocery Shopping",
    amount: "OMR 320.50",
    category: "House",
    department: "House Management",
    date: "2024-01-11",
    status: "auto-approved",
    submittedBy: "House Manager",
    description: "Weekly grocery shopping for residence",
    receiptUrl: "#",
    icon: Home,
  },
];

const categories = ["All", "Office", "Fleet", "House", "Travel", "Maintenance"];
const statuses = ["All", "pending", "approved", "rejected", "auto-approved"];

interface ExpensesProps {
  userRole: string;
}

export function Expenses({ userRole }: ExpensesProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewExpense, setShowNewExpense] = useState(false);

  const filteredExpenses = expenseData.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || expense.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="status-approved">Approved</Badge>;
      case "pending":
        return <Badge className="status-pending">Pending</Badge>;
      case "rejected":
        return <Badge className="status-rejected">Rejected</Badge>;
      case "auto-approved":
        return <Badge className="bg-info text-info-foreground">Auto-Approved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount.replace(/[^\d.]/g, ''));
      return total + amount;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all organizational expenses
          </p>
        </div>
        <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your expense claim for approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Expense Title</Label>
                  <Input id="title" placeholder="Enter expense title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="OMR 0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide details about this expense"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt Upload</Label>
                <Input id="receipt" type="file" accept="image/*,.pdf" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewExpense(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewExpense(false)}>
                  Submit Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Expenses</p>
                <p className="stat-value">OMR {getTotalExpenses().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value">{expenseData.filter(e => e.status === "pending").length}</p>
              </div>
              <Receipt className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Approved</p>
                <p className="stat-value">{expenseData.filter(e => e.status === "approved").length}</p>
              </div>
              <Receipt className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">This Month</p>
                <p className="stat-value">{expenseData.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="dashboard-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <expense.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{expense.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {expense.category} • Submitted by {expense.submittedBy}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">ID: {expense.id}</span>
                        <span className="text-sm text-muted-foreground">Date: {expense.date}</span>
                        <span className="text-sm text-muted-foreground">Dept: {expense.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-2xl font-bold text-primary">{expense.amount}</span>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{expense.description}</p>
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Receipt className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}