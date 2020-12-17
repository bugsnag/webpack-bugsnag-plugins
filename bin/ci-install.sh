if [ "$WEBPACK_VERSION" -eq "3" ]; then
  npm i --no-save --no-package-lock webpack@3
elif [ "$WEBPACK_VERSION" -eq "4" ]; then
  npm i --no-save --no-package-lock webpack@$WEBPACK_VERSION webpack-cli@3 mini-css-extract-plugin css-loader
else
  npm i --no-save --no-package-lock webpack@$WEBPACK_VERSION webpack-cli mini-css-extract-plugin css-loader
fi
