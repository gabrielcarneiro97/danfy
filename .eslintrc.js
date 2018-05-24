module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "rules": {
    "jsx-a11y/anchor-is-valid": ["error", {
      "specialLink": ["hrefLeft", "hrefRight"],
      "aspects": ["noHref", "invalidHref", "preferButton"]
    }]
  },
};
