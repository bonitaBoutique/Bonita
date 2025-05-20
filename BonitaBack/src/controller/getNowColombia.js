module.exports = (req, res) => {
  const now = new Date();
  const dateColombia = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const todayColombia = dateColombia.toISOString().split('T')[0];
  res.json({ today: todayColombia });
};