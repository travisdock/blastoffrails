const pluginWebc = require("@11ty/eleventy-plugin-webc");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginWebc, {
    components: "src/_components/**/*.webc"
  });
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/images");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
