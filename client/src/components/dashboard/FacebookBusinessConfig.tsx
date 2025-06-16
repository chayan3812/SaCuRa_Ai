import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Settings, Shield, Zap, Users } from 'lucide-react';

interface BusinessConfig {
  configurationId: string;
  appId: string;
  pixelId: string | null;
  features: {
    loginForBusiness: boolean;
    conversionsAPI: boolean;
    advancedMatching: boolean;
    serverSideEvents: boolean;
  };
  permissions: string[];
  status: string;
}

interface ValidationResult {
  valid: boolean;
  configurationId: string;
  validatedPermissions: string[];
  recommendations: string[];
  status: string;
}

export default function FacebookBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessConfig();
  }, []);

  const fetchBusinessConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facebook/business-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        throw new Error('Failed to fetch business configuration');
      }
    } catch (error) {
      console.error('Error fetching business config:', error);
      toast({
        title: "Configuration Error",
        description: "Failed to load Facebook business configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateConfiguration = async () => {
    if (!config) return;

    try {
      setValidating(true);
      const response = await fetch('/api/facebook/validate-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId: config.configurationId,
          permissions: config.permissions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setValidation(data);
        
        toast({
          title: data.valid ? "Configuration Valid" : "Configuration Issues",
          description: data.status,
          variant: data.valid ? "default" : "destructive",
        });
      } else {
        throw new Error('Failed to validate configuration');
      }
    } catch (error) {
      console.error('Error validating config:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate configuration",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No business configuration found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Facebook Business Configuration
          </CardTitle>
          <CardDescription>
            Business-grade authentication and conversion tracking configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Configuration ID</h3>
                <p className="text-sm text-gray-600">Facebook Business Configuration Identifier</p>
              </div>
              <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                {config.status}
              </Badge>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm">
              {config.configurationId}
            </div>
          </div>

          <Separator />

          {/* App Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">App ID</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono">
                {config.appId || 'Not configured'}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pixel ID</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono">
                {config.pixelId || 'Not configured'}
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Features
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(config.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </h4>
            <div className="flex flex-wrap gap-2">
              {config.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Validation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Configuration Validation</h4>
              <Button 
                onClick={validateConfiguration}
                disabled={validating}
                size="sm"
              >
                {validating ? 'Validating...' : 'Validate'}
              </Button>
            </div>

            {validation && (
              <div className={`p-3 rounded-lg border ${
                validation.valid 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {validation.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">
                    {validation.status}
                  </span>
                </div>
                
                {validation.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Recommendations:</p>
                    <ul className="text-sm space-y-1">
                      {validation.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}