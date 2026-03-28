const fs = require('fs');

let file = fs.readFileSync('src/routes/home.ts', 'utf8');

// Fix the hotel assignment
file = file.replace(/hotels = hotelResult\.results \|\| \[\]/g, "featuredHotels = hotelsResult.results || []");

// Fix the guide assignment
file = file.replace(/guides = guideResult\.results \|\| \[\]/g, "featuredGuides = guideResult.results || []");

// Fix the study tour assignment
file = file.replace(/studyTours = tourResult\.results \|\| \[\]/g, "featuredStudyTours = tourResult.results || []");

fs.writeFileSync('src/routes/home.ts', file);
console.log("Patched home.ts variable assignments");
