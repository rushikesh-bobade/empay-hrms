const searchService = require('./search.service');

const search = async (req, res) => {
  try {
    const rawQuery = req.query.q;
    const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery) || '';
    
    if (typeof query !== 'string' || query.length < 2) {
      return res.json({ success: true, data: [] });
    }
    const results = await searchService.search(query);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

module.exports = { search };
