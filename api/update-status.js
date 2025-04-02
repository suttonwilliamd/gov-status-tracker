import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async (req, res) => {
  const { domain, status } = req.body;
  
  try {
    // Get previous status
    const { data: prevData } = await supabase
      .from('status_history')
      .select('status, timestamp, downSince')
      .eq('domain', domain)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    const prevStatus = prevData?.[0];
    const timestamp = new Date().toISOString();
    
    // Determine if status changed
    const statusChanged = !prevStatus || prevStatus.status !== status;
    
    // Only record changes to save database space
    if (statusChanged) {
      await supabase.from('status_history').insert([{
        domain,
        status,
        timestamp,
        downSince: status === 'offline' ? timestamp : 
                  (prevStatus?.status === 'offline' ? prevStatus.downSince : null)
      }]);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
