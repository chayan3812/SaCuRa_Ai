import fs from "fs";

const generateFakeInsights = () => {
  const impressionData: { [key: string]: number } = {};
  
  // Generate realistic impression data for 7 days x 12 time bands (2-hour intervals)
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const key = `${day}_${hour}`;
      // Higher impressions during peak hours (9-11, 13-15, 19-21)
      let baseImpressions = Math.floor(Math.random() * 150) + 50;
      
      if ((hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 15) || (hour >= 19 && hour <= 21)) {
        baseImpressions = Math.floor(Math.random() * 200) + 150; // Peak hours
      }
      
      impressionData[key] = baseImpressions;
    }
  }

  const fakeInsightsData = {
    data: [
      {
        name: "page_impressions_by_day_time_band",
        period: "lifetime",
        values: [
          {
            end_time: new Date().toISOString(),
            value: impressionData,
          },
        ],
      },
    ],
  };

  fs.writeFileSync("./test/fakeInsights.json", JSON.stringify(fakeInsightsData, null, 2));
  console.log("🧪 Fake insight data generated: ./test/fakeInsights.json");
  console.log(`📊 Generated ${Object.keys(impressionData).length} time band entries`);
};

generateFakeInsights();