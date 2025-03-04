/** Message from Devvit to the web view. */
export type DevvitMessage =
    | {
  type: 'initialData';
  data: {
    username: string;
    lastLocation: LocationData | null;
  }
}
    | {
  type: 'locationUpdated';
  data: {
    location: LocationData;
  }
};

/** Message from the web view to Devvit. */
export type WebViewMessage =
    | { type: 'webViewReady' }
    | {
  type: 'locationClicked';
  data: {
    location: LocationData;
  }
} | {
  type: 'gameFinished';
  data: {
    roundScore: number;
  };
 }; //| {
//     type: 'loadCountryInfo';
//     data:  {country: string};
// };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};

/** Location data structure */
export type LocationData = {
  lat: number;
  lng: number;
  name?: string;
  details?: string;
};