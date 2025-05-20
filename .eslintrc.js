// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
};
