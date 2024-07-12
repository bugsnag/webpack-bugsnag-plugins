if [ "$WEBPACK_VERSION" -eq "3" ]; then
  npm i --no-save --no-package-lock webpack@3
elif [ "$WEBPACK_VERSION" -eq "4" ]; then
  npm i --no-save --no-package-lock webpack@4 webpack-cli@4 mini-css-extract-plugin@1 css-loader@5
else
  npm i --no-save --no-package-lock webpack@$WEBPACK_VERSION webpack-cli mini-css-extract-plugin@1 css-loader
fi
