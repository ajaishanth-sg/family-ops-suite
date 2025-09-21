import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  name: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  period_start: string;
  period_end: string;
  department?: string;
  manager_id?: string;
  status: 'active' | 'inactive' | 'completed';
  created_by: string;
  created_at: string;
  manager?: {
    first_name: string;
    last_name: string;
  };
}

interface BudgetsProps {
  userRole: string;
}

export function Budgets({ userRole }: BudgetsProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  const [newBudget, setNewBudget] = useState({
    name: "",
    category: "",
    allocated_amount: "",
    period_start: "",
    period_end: "",
    department: "",
    manager_id: ""
  });

  useEffect(() => {
    fetchBudgets();
    fetchUsers();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          manager:profiles!budgets_manager_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets((data as Budget[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('is_active', true);

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const createBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('budgets')
        .insert([{
          ...newBudget,
          allocated_amount: parseFloat(newBudget.allocated_amount),
          manager_id: newBudget.manager_id || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Budget created successfully"
      });

      setShowNewBudget(false);
      setNewBudget({
        name: "",
        category: "",
        allocated_amount: "",
        period_start: "",
        period_end: "",
        department: "",
        manager_id: ""
      });
      fetchBudgets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateBudgetStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Budget status updated"
      });
      fetchBudgets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredBudgets = budgets.filter(budget => 
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (budget.department && budget.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      completed: "outline"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-orange-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getUtilizationPercentage = (spent: number, allocated: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };

  const canManageBudgets = ["chairman", "financial-advisor", "head-of-operations"].includes(userRole);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining_amount, 0);

  if (loading) {
    return <div className="space-y-6"><div>Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage departmental budgets
          </p>
        </div>
        {canManageBudgets && (
          <Dialog open={showNewBudget} onOpenChange={setShowNewBudget}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Budget Name</Label>
                  <Input
                    id="name"
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                    placeholder="Q1 Marketing Budget"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    placeholder="Marketing, Operations, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="allocated_amount">Allocated Amount (OMR)</Label>
                  <Input
                    id="allocated_amount"
                    type="number"
                    value={newBudget.allocated_amount}
                    onChange={(e) => setNewBudget({...newBudget, allocated_amount: e.target.value})}
                    placeholder="10000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newBudget.department}
                    onChange={(e) => setNewBudget({...newBudget, department: e.target.value})}
                    placeholder="Marketing Department"
                  />
                </div>
                <div>
                  <Label htmlFor="manager_id">Budget Manager</Label>
                  <Select
                    value={newBudget.manager_id}
                    onValueChange={(value) => setNewBudget({...newBudget, manager_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="period_start">Period Start</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={newBudget.period_start}
                      onChange={(e) => setNewBudget({...newBudget, period_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="period_end">Period End</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={newBudget.period_end}
                      onChange={(e) => setNewBudget({...newBudget, period_end: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={createBudget} className="w-full">
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OMR {totalAllocated.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OMR {totalSpent.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}% utilized
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OMR {totalRemaining.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <TrendingDown className="h-3 w-3" />
              Available to spend
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Search budgets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBudgets.map((budget) => {
            const utilizationPercentage = getUtilizationPercentage(budget.spent_amount, budget.allocated_amount);
            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {budget.category} {budget.department && `• ${budget.department}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(budget.status)}
                      {canManageBudgets && (
                        <Select
                          value={budget.status}
                          onValueChange={(value) => updateBudgetStatus(budget.id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Allocated:</span>
                      <div className="font-semibold">OMR {budget.allocated_amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Spent:</span>
                      <div className="font-semibold">OMR {budget.spent_amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>
                      <div className="font-semibold">OMR {budget.remaining_amount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span className={getUtilizationColor(utilizationPercentage)}>
                        {utilizationPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={utilizationPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(budget.period_start).toLocaleDateString()} - {new Date(budget.period_end).toLocaleDateString()}
                      </span>
                    </div>
                    {budget.manager && (
                      <div>
                        Manager: {budget.manager.first_name} {budget.manager.last_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No budgets found</p>
          </div>
        )}
      </div>
    </div>
  );
}