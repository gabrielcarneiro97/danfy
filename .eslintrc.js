module.exports = {
  "env": {
    "browser": true
  },
  "plugins": [
    "react-hooks",
    "@typescript-eslint"
  ],
  "extends": "airbnb",
  "parser":  "@typescript-eslint/parser",
  "settings": {
    "import/resolver": {
      "node": {
      "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  "rules": {
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": ["error", {
      "specialLink": ["hrefLeft", "hrefRight"],
      "aspects": ["noHref", "invalidHref", "preferButton"]
    }],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ],
   "react/jsx-filename-extension": [1, { "extensions": [".tsx", ".jsx"] }],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}],
    "no-underscore-dangle": "off",
    "react/no-did-mount-set-state" : "off",
  },
};
