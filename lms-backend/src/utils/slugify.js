const slugify = require('slugify');

// Generate unique slug
const generateSlug = (text) => {
  const slug = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
};

module.exports = { generateSlug };