import { getPokemonHomeArtwork, getPokemonModel } from '@/utils/type-colors';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

const MODEL_VIEWER_SCRIPT =
  'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';

function buildHtml(modelUrl: string, posterUrl: string) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <script type="module" src="${MODEL_VIEWER_SCRIPT}"></script>
    <style>
      html, body { margin: 0; height: 100%; overflow: hidden; background: transparent; }
      model-viewer {
        width: 100%;
        height: 100%;
        background: transparent;
        --poster-color: transparent;
        --progress-bar-height: 0px;
      }
    </style>
  </head>
  <body>
    <model-viewer
      src="${modelUrl}"
      poster="${posterUrl}"
      autoplay
      auto-rotate
      auto-rotate-delay="0"
      rotation-per-second="24deg"
      camera-controls
      disable-zoom
      disable-pan
      touch-action="pan-y"
      interaction-prompt="none"
      shadow-intensity="1"
      exposure="1.1"
      camera-orbit="0deg 80deg auto"></model-viewer>
    <script>
      const viewer = document.querySelector('model-viewer');
      const send = (message) => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(message);
      viewer.addEventListener('load', () => send('loaded'));
      viewer.addEventListener('error', () => send('error'));
    </script>
  </body>
</html>`;
}

type PokemonModelViewerProps = {
  id: number;
  shiny?: boolean;
  height: number;
};

export function PokemonModelViewer({ id, shiny = false, height }: PokemonModelViewerProps) {
  const modelUrl = getPokemonModel(id, shiny);
  const posterUrl = getPokemonHomeArtwork(id, shiny);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [failedModel, setFailedModel] = useState<string | null>(null);

  if (Platform.OS === 'web' || failedModel === modelUrl) {
    return (
      <Image
        source={{ uri: posterUrl }}
        contentFit="contain"
        transition={250}
        style={{ height, alignSelf: 'stretch' }}
      />
    );
  }

  return (
    <View style={{ height, alignSelf: 'stretch' }}>
      <WebView
        key={modelUrl}
        originWhitelist={['*']}
        source={{ html: buildHtml(modelUrl, posterUrl), baseUrl: 'https://localhost/' }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'loaded') setLoadedModel(modelUrl);
          else setFailedModel(modelUrl);
        }}
        onError={() => setFailedModel(modelUrl)}
      />
      {loadedModel !== modelUrl ? (
        <ActivityIndicator
          color="#FFFFFF"
          style={{ position: 'absolute', bottom: 8, alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
}
