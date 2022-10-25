module.exports = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/index.html"
      }
    ];
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(wav)$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]"
      }
    });

    return config;
  }
};
