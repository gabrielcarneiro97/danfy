module.exports = {
    "env": {
        "browser": true
      },
      "plugins": [
        "react-hooks"
      ],
      "extends": "airbnb",
      "parser": "babel-eslint",
      "rules": {
        "jsx-a11y/href-no-hash": "off",
        "jsx-a11y/anchor-is-valid": ["error", {
          "specialLink": ["hrefLeft", "hrefRight"],
          "aspects": ["noHref", "invalidHref", "preferButton"]
        }],
        "import/no-extraneous-dependencies": ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}],
        "no-underscore-dangle": "off",
        "react/no-did-mount-set-state" : "off",
      },
};
