const fs = require('fs');

let code = fs.readFileSync('src/routes/home.ts', 'utf8');
code = code.replace(
  `LIMIT 4"
    ).all()`,
  `LIMIT 4\`).bind(today, today).all()
    hotels = hotelResult.results || []

    // Fetch guides
    const guideResult = await c.env.DB.prepare(
      "SELECT * FROM guides WHERE is_featured = 1 ORDER BY sort_order DESC LIMIT 4"
    ).all()
    guides = guideResult.results || []

    // Fetch study tours
    const tourResult = await c.env.DB.prepare(
      "SELECT * FROM study_tours WHERE is_featured = 1 ORDER BY sort_order DESC LIMIT 4"
    ).all()
    studyTours = tourResult.results || []

    // Fetch info sharing
    const infoResult = await c.env.DB.prepare(
      "SELECT * FROM blogs WHERE is_published = 1 AND category = 'info' ORDER BY sort_order DESC, created_at DESC LIMIT 4"
    ).all()
    `
);

fs.writeFileSync('src/routes/home.ts', code);
