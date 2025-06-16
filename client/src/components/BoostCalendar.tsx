import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Zap } from "lucide-react";

const localizer = momentLocalizer(moment);

interface ScheduledBoost {
  id: string;
  postId: string;
  date: string;
  budget?: number;
  status?: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  postId?: string;
  budget?: number;
  status?: string;
  isAISuggestion?: boolean;
  rank?: number;
}

interface TimeSlotRecommendation {
  date: string;
  score: number;
  dayName: string;
  timeLabel: string;
  confidence: number;
  rank: number;
}

export const BoostCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [suggestions, setSuggestions] = useState<CalendarEvent[]>([]);
  const [recommendations, setRecommendations] = useState<TimeSlotRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    loadScheduledBoosts();
  }, []);

  const loadScheduledBoosts = async () => {
    try {
      const response = await fetch("/api/facebook/scheduled-boosts", {
        credentials: 'include'
      });
      const data: ScheduledBoost[] = await response.json();
      
      const calendarEvents = data.map((boost) => ({
        title: `Boost: ${boost.postId}${boost.budget ? ` ($${boost.budget})` : ''}`,
        start: new Date(boost.date),
        end: new Date(boost.date),
        postId: boost.postId,
        budget: boost.budget,
        status: boost.status
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading scheduled boosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlotRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch("/api/facebook/recommend-time-slots", {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.recommendedSlots) {
        setRecommendations(data.recommendedSlots);
        
        // Convert recommendations to calendar events with green overlay
        const suggestionEvents = data.recommendedSlots.map((slot: TimeSlotRecommendation, index: number) => ({
          title: `🔥 AI Suggestion #${slot.rank}`,
          start: new Date(slot.date),
          end: new Date(slot.date),
          isAISuggestion: true,
          rank: slot.rank,
          allDay: false
        }));
        
        setSuggestions(suggestionEvents);
      }
    } catch (error) {
      console.error('Error loading time slot recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSelect = async ({ start }: { start: Date }) => {
    const postId = prompt("Enter Post ID to schedule boost:");
    if (!postId) return;

    const budget = prompt("Enter daily budget (optional):");
    const budgetValue = budget ? parseFloat(budget) : undefined;

    try {
      const response = await fetch("/api/facebook/scheduled-boosts", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          date: start.toISOString(),
          budget: budgetValue
        })
      });

      if (response.ok) {
        alert("Scheduled boost added!");
        loadScheduledBoosts();
      } else {
        alert("Failed to schedule boost");
      }
    } catch (error) {
      console.error('Error scheduling boost:', error);
      alert("Error scheduling boost");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    const message = `Post ID: ${event.postId}\n` +
                   `Date: ${moment(event.start).format('YYYY-MM-DD')}\n` +
                   `Budget: ${event.budget ? `$${event.budget}` : 'Not specified'}\n` +
                   `Status: ${event.status || 'Scheduled'}`;
    alert(message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI-Powered Time Slot Recommendations
          </CardTitle>
          <Button 
            onClick={loadTimeSlotRecommendations}
            disabled={loadingRecommendations}
            size="sm"
          >
            {loadingRecommendations ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Get Recommendations
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={rec.rank <= 2 ? "default" : "secondary"}>
                        #{rec.rank} Recommended
                      </Badge>
                      <Badge variant="outline">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{rec.dayName} at {rec.timeLabel}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Engagement Score: {rec.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(rec.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click "Get Recommendations" to see AI-powered optimal posting times based on your page insights
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Boosts Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={[...events, ...suggestions]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={(event: CalendarEvent) => ({
                style: {
                  backgroundColor: event.isAISuggestion ? '#d1fae5' : 
                                  event.status === 'active' ? '#10b981' : 
                                  event.status === 'failed' ? '#ef4444' : '#3b82f6',
                  borderColor: event.isAISuggestion ? '#a7f3d0' :
                              event.status === 'active' ? '#059669' : 
                              event.status === 'failed' ? '#dc2626' : '#2563eb',
                  color: event.isAISuggestion ? '#047857' : '#ffffff',
                  fontWeight: event.isAISuggestion ? 'bold' : 'normal'
                }
              })}
              views={['month', 'week', 'day']}
              defaultView="month"
              selectable
              onSelectSlot={handleSelect}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};