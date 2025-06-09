import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/types";

export default function EmployeeMonitor() {
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  const getStatusColor = (employee: Employee) => {
    if (!employee.isActive) return 'bg-gray-50 border-gray-200';
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return 'bg-amber-50 border-amber-200';
    }
    return 'bg-green-50 border-green-200';
  };

  const getStatusText = (employee: Employee) => {
    if (!employee.isActive) return '○ Away';
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return '⚠ Delayed';
    }
    return '✓ Active';
  };

  const getStatusTextColor = (employee: Employee) => {
    if (!employee.isActive) return 'text-gray-600';
    if (employee.avgResponseTime && employee.avgResponseTime > 120) {
      return 'text-amber-600';
    }
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 w-4 h-4" />
            </div>
            <span>Employee Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted-foreground/20 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600 w-4 h-4" />
          </div>
          <span>Employee Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employees added yet.</p>
              <p className="text-sm">Add team members to monitor their performance.</p>
            </div>
          ) : (
            employees.map((employee) => (
              <div
                key={employee.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(employee)}`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={employee.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    Avg: {formatTime(employee.avgResponseTime)}
                  </p>
                  <p className={`text-xs ${getStatusTextColor(employee)}`}>
                    {getStatusText(employee)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
