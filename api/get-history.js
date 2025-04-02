import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async (req, res) => {
  const { domain, limit = 30 } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('status_history')
      .select('*')
      .eq('domain', domain)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
