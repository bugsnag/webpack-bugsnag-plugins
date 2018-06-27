if [ "$WEBPACK_VERSION" -eq "3" ]; then
  npm i --no-save --no-package-lock webpack@3
else
  npm i --no-save --no-package-lock webpack@4 webpack-cli mini-css-extract-plugin css-loader
fi
