module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};