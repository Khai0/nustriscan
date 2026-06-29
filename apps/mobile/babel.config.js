module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@':           './src',
          '@screens':    './src/screens',
          '@components': './src/components',
          '@hooks':      './src/hooks',
          '@store':      './src/store',
          '@services':   './src/services',
          '@lib':        './src/lib',
          '@navigation': './src/navigation',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  }
}
