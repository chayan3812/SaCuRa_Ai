import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const CampaignMonitor: React.FC = () => {
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<any>({});

  useEffect(() => {
    const loadCampaigns = () => {
      const ids = JSON.parse(localStorage.getItem("campaignIds") || "[]");
      setCampaigns(ids);
    };
    loadCampaigns();
  }, []);

  const fetchStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/facebook/campaign-status/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStatusMap((prev: any) => ({ ...prev, [id]: data }));
    } catch (error) {
      console.error('Error fetching campaign status:', error);
      setStatusMap((prev: any) => ({ 
        ...prev, 
        [id]: { error: 'Failed to fetch status' } 
      }));
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📊 Campaign Monitor</h2>
      {campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No campaigns found. Create campaigns from the Boost Post Panel to see them here.
        </div>
      ) : (
        <ul className="space-y-4">
          {campaigns.map((id) => (
            <li key={id} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Campaign ID: {id}</span>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  onClick={() => fetchStatus(id)}
                >
                  Refresh Status
                </button>
              </div>
              <pre className="bg-gray-100 mt-2 p-3 rounded text-sm overflow-auto max-h-48">
                {JSON.stringify(statusMap[id] || { status: 'Click Refresh to load data' }, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};