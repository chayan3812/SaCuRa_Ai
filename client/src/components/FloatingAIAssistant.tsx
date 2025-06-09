import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      // Here you would integrate with your AI service
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl border">
          <CardHeader className="gradient-bg rounded-t-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-medium">SaCuRa AI Assistant</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      Online
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-6 h-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-foreground">Hi! I'm your AI assistant. I can help you with:</p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Ad optimization suggestions</li>
                  <li>• Customer service insights</li>
                  <li>• Performance analysis</li>
                  <li>• Restriction prevention</li>
                  <li>• Campaign recommendations</li>
                </ul>
              </div>
              
              <div className="bg-sacura-primary/10 p-3 rounded-lg border border-sacura-primary/20">
                <p className="text-sm text-sacura-primary font-medium">🎯 Quick Tip</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try asking "How can I improve my ad performance?" or "What should I do about policy warnings?"
                </p>
              </div>
            </div>
          </CardContent>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                className="bg-sacura-primary hover:bg-sacura-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 gradient-bg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <Bot className="text-white w-6 h-6" />
      </Button>
    </div>
  );
}
