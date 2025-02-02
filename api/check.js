export default async (req, res) => {
  const url = req.query.url;
  try {
    const response = await fetch(`https://${url}`, {
      method: 'HEAD',
      redirect: 'manual'
    });
    res.status(200).json({
      status: response.status < 400 ? 'online' : 'offline',
      code: response.status
    });
  } catch (error) {
    res.status(200).json({ status: 'offline', code: 0 });
  }
};
