export default async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all domains
    const { data: domains } = await supabase
      .from('status_history')
      .select('domain')
      .lt('timestamp', thirtyDaysAgo.toISOString())
      .distinct();
    
    for (const { domain } of domains) {
      // For each domain, calculate daily uptime % for old data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // 90 days ago
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 30); // 30 days ago
      
      const { data } = await supabase
        .from('status_history')
        .select('*')
        .eq('domain', domain)
        .gte('timestamp', startDate.toISOString())
        .lt('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });
      
      // Calculate daily statistics
      const dailyStats = calculateDailyStats(data);
      
      // Store aggregated data
      await supabase.from('daily_uptime').upsert(
        dailyStats.map(day => ({
          domain,
          date: day.date,
          uptime_pct: day.uptimePct,
          downtime_minutes: day.downtimeMinutes,
          outages: day.outages
        }))
      );
      
      // Delete the raw data that's now aggregated
      await supabase
        .from('status_history')
        .delete()
        .eq('domain', domain)
        .gte('timestamp', startDate.toISOString())
        .lt('timestamp', endDate.toISOString());
    }
  } catch (error) {
    console.error('Aggregation error:', error);
  }
};
