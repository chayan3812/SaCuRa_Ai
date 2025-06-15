import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoPostConfig } from "@/components/AutoPostConfig";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, BarChart3 } from "lucide-react";

export default function AutoPostAdmin() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Auto-Post Administration</h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage intelligent content automation for your Facebook pages
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Phase 3 Active
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Auto-Post Engine
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              AI-powered content generation and publishing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Monitoring
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real-time</div>
            <p className="text-xs text-muted-foreground">
              Continuous engagement analysis and optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Quality
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OpenAI</div>
            <p className="text-xs text-muted-foreground">
              GPT-4 powered content generation
            </p>
          </CardContent>
        </Card>
      </div>

      <AutoPostConfig />

      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>
            Advanced capabilities of your AI Auto-Post Engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Performance Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time engagement rate monitoring</li>
                <li>• Creative fatigue detection</li>
                <li>• Automated threshold-based triggers</li>
                <li>• Historical performance tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Content Generation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI-powered post creation</li>
                <li>• Topic-specific content optimization</li>
                <li>• Engagement-focused messaging</li>
                <li>• Brand voice consistency</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Publishing Automation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic post scheduling</li>
                <li>• Multi-format content support</li>
                <li>• Error handling and retry logic</li>
                <li>• Performance feedback loops</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Monitoring & Control</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manual trigger capabilities</li>
                <li>• Real-time configuration updates</li>
                <li>• Comprehensive logging</li>
                <li>• Performance analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}