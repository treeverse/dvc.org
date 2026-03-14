export default {
  '*.ts?(x)': () => 'yarn lint-ts',
  '*.{json,md,mdx,yml,yaml}': 'prettier --write',
  '*.css': ['prettier --write', 'stylelint --fix'],
  '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix']
}
