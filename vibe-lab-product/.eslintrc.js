module.exports = {
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "import"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc"
        }
      }
    ],
    "import/no-unresolved": "error",
    "import/no-cycle": "error",
    "no-console": [
      "warn",
      {
        "allow": [
          "warn",
          "error"
        ]
      }
    ],
    "prefer-const": "error",
    "no-var": "error",
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": [
              "../../*"
            ],
            "message": "Use absolute imports with @/ instead of relative imports going up multiple levels"
          }
        ]
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    }
  },
  "overrides": [
    {
      "files": [
        "*.test.ts",
        "*.test.tsx"
      ],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
};