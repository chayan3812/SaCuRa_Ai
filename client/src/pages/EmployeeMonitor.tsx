import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeMonitor() {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
  });

  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
    refetchInterval: 30000,
  });

  const handleAddEmployee = async () => {
    try {
      await apiRequest('/api/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee)
      });

      setNewEmployee({ name: "", email: "", role: "" });
      setIsAddingEmployee(false);
      
      toast({
        title: "Employee added",
        description: "New employee has been added to the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  const getPerformanceColor = (avgResponseTime?: number) => {
    if (!avgResponseTime) return 'text-gray-600';
    if (avgResponseTime <= 60) return 'text-green-600';
    if (avgResponseTime <= 120) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusColor = (employee: Employee) => {
    if (!employee.isActive) return 'bg-gray-100 text-gray-800';
    if (employee.avgResponseTime && employee.avgResponseTime <= 60) return 'bg-green-100 text-green-800';
    if (employee.avgResponseTime && employee.avgResponseTime <= 120) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (employee: Employee) => {
    if (!employee.isActive) return 'Offline';
    if (employee.avgResponseTime && employee.avgResponseTime <= 60) return 'Excellent';
    if (employee.avgResponseTime && employee.avgResponseTime <= 120) return 'Good';
    return 'Needs Improvement';
  };

  const activeEmployees = employees.filter(e => e.isActive).length;
  const totalResponses = employees.reduce((sum, e) => sum + e.totalResponses, 0);
  const avgResponseTime = employees.length > 0 
    ? employees.reduce((sum, e) => sum + (e.avgResponseTime || 0), 0) / employees.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Monitor</h1>
          <p className="text-muted-foreground">Track team performance and response times</p>
        </div>
        <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
          <DialogTrigger asChild>
            <Button className="bg-sacura-primary hover:bg-sacura-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Employee name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="employee@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Customer Service Agent"
                />
              </div>
              <Button 
                onClick={handleAddEmployee}
                disabled={!newEmployee.name || !newEmployee.email || !newEmployee.role}
                className="w-full"
              >
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                <p className="text-sm text-sacura-secondary">Team size</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                <p className="text-sm text-green-600">Online</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold text-foreground">{totalResponses}</p>
                <p className="text-sm text-sacura-secondary">Today</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(avgResponseTime)}`}>
                  {formatTime(avgResponseTime)}
                </p>
                <p className="text-sm text-sacura-secondary">Response time</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sacura-primary" />
              <span>Team Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted-foreground/20 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted-foreground/20 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : employees.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-sacura-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-sacura-primary">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(employee)}>
                          {getStatusText(employee)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Responses: </span>
                          <span className="font-medium">{employee.totalResponses}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Avg: </span>
                          <span className={`font-medium ${getPerformanceColor(employee.avgResponseTime)}`}>
                            {formatTime(employee.avgResponseTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employees added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sacura-primary" />
              <span>Performance Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Top Performers</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(e => e.avgResponseTime && e.avgResponseTime <= 60)
                      .slice(0, 3)
                      .map(employee => (
                        <div key={employee.id} className="text-sm">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {formatTime(employee.avgResponseTime)}
                          </span>
                        </div>
                      ))}
                    {employees.filter(e => e.avgResponseTime && e.avgResponseTime <= 60).length === 0 && (
                      <p className="text-sm text-muted-foreground">No top performers yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-amber-700 mb-2">Needs Attention</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(e => e.avgResponseTime && e.avgResponseTime > 120)
                      .slice(0, 3)
                      .map(employee => (
                        <div key={employee.id} className="text-sm">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {formatTime(employee.avgResponseTime)}
                          </span>
                        </div>
                      ))}
                    {employees.filter(e => e.avgResponseTime && e.avgResponseTime > 120).length === 0 && (
                      <p className="text-sm text-amber-700">All employees performing well!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}