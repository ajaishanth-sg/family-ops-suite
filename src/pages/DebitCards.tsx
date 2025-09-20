import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CreditCard, Plus, Eye, EyeOff, RefreshCw } from "lucide-react";

const cardData = [
  {
    id: "CARD-001",
    cardNumber: "**** **** **** 4532",
    holder: "Executive Assistant",
    department: "Operations",
    balance: 45.50,
    limit: 1000,
    status: "active",
    alertThreshold: 50,
    lastTransaction: "Office supplies - OMR 25.00",
    expiryDate: "12/26",
  },
  {
    id: "CARD-002", 
    cardNumber: "**** **** **** 7891",
    holder: "Muscat House Manager",
    department: "House Management",
    balance: 320.75,
    limit: 500,
    status: "active",
    alertThreshold: 50,
    lastTransaction: "Grocery shopping - OMR 85.50",
    expiryDate: "08/25",
  },
  {
    id: "CARD-003",
    cardNumber: "**** **** **** 2468",
    holder: "Fleet Manager",
    department: "Fleet Management", 
    balance: 125.20,
    limit: 800,
    status: "active",
    alertThreshold: 50,
    lastTransaction: "Fuel - OMR 60.00",
    expiryDate: "03/27",
  },
  {
    id: "CARD-004",
    cardNumber: "**** **** **** 9753",
    holder: "Abroad House Manager",
    department: "House Management",
    balance: 15.30,
    limit: 600,
    status: "low-balance",
    alertThreshold: 50,
    lastTransaction: "Maintenance supplies - USD 45.00",
    expiryDate: "09/26",
  },
  {
    id: "CARD-005",
    cardNumber: "**** **** **** 1357",
    holder: "Staff Assistant",
    department: "Operations",
    balance: 0.00,
    limit: 300,
    status: "blocked",
    alertThreshold: 50,
    lastTransaction: "ATM Withdrawal - OMR 50.00",
    expiryDate: "11/25",
  },
];

interface DebitCardsProps {
  userRole: string;
}

export function DebitCards({ userRole }: DebitCardsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCardNumbers, setShowCardNumbers] = useState<{ [key: string]: boolean }>({});

  const filteredCards = cardData.filter(card => 
    card.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="status-approved">Active</Badge>;
      case "low-balance":
        return <Badge className="status-pending">Low Balance</Badge>;
      case "blocked":
        return <Badge className="status-rejected">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBalanceColor = (balance: number, threshold: number) => {
    if (balance <= threshold) return "text-danger";
    if (balance <= threshold * 2) return "text-warning";
    return "text-success";
  };

  const getProgressColor = (balance: number, limit: number, threshold: number) => {
    const percentage = (balance / limit) * 100;
    if (percentage <= (threshold / limit) * 100) return "bg-danger";
    if (percentage <= ((threshold * 2) / limit) * 100) return "bg-warning";
    return "bg-success";
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const lowBalanceCards = cardData.filter(card => card.balance <= card.alertThreshold);
  const totalBalance = cardData.reduce((sum, card) => sum + card.balance, 0);
  const activeCards = cardData.filter(card => card.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debit Card Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage debit card balances and usage
          </p>
        </div>
        {userRole === "hoo" && (
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Issue New Card
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Balance</p>
                <p className="stat-value">OMR {totalBalance.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Active Cards</p>
                <p className="stat-value">{activeCards}</p>
              </div>
              <CreditCard className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Low Balance Alerts</p>
                <p className="stat-value">{lowBalanceCards.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Cards</p>
                <p className="stat-value">{cardData.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Balance Alerts */}
      {lowBalanceCards.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Balance Alerts
            </CardTitle>
            <CardDescription>
              The following cards have balances below the alert threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowBalanceCards.map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div>
                    <p className="font-medium">{card.holder}</p>
                    <p className="text-sm text-muted-foreground">{card.cardNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-danger">OMR {card.balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">of OMR {card.limit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by cardholder or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCards.map((card) => (
          <Card key={card.id} className="dashboard-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{card.holder}</CardTitle>
                  <CardDescription>{card.department}</CardDescription>
                </div>
                {getStatusBadge(card.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Number */}
              <div className="flex items-center justify-between p-4 bg-gradient-primary rounded-lg text-primary-foreground">
                <div>
                  <p className="text-sm opacity-90">Card Number</p>
                  <p className="font-mono text-lg">
                    {showCardNumbers[card.id] ? "4532 1234 5678 9876" : card.cardNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardNumberVisibility(card.id)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  {showCardNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Balance and Limit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                  <span className={`text-2xl font-bold ${getBalanceColor(card.balance, card.alertThreshold)}`}>
                    OMR {card.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Limit: OMR {card.limit}</span>
                  <span className="text-muted-foreground">Expires: {card.expiryDate}</span>
                </div>
                <Progress 
                  value={(card.balance / card.limit) * 100} 
                  className="h-2"
                />
              </div>

              {/* Last Transaction */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Last Transaction</p>
                <p className="text-sm font-medium">{card.lastTransaction}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View History
                </Button>
                {userRole === "hoo" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={card.status === "blocked" ? "border-success text-success" : "border-danger text-danger"}
                  >
                    {card.status === "blocked" ? "Unblock" : "Block"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}