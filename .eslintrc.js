module.exports = {
  'extends': 'airbnb',
  'parser': 'babel-eslint',
  'env': { },
  'plugins': [
    'react',
    'react-hooks'
  ],
  'rules': {
    'no-use-before-define': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off'
  },
  'globals': {
    'fetch': false
  }
}