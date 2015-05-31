package com.qibaowu.buyer;

import android.app.Activity;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

/**
 * Created by ronghui on 15/4/11.
 */
public class AppWebChromeClient extends WebChromeClient {
    private Activity mContext;

    public AppWebChromeClient(Activity activity) {
        mContext = activity;
    }

    @Override
    public void onProgressChanged(WebView view, int progress) {
        // Activities and WebViews measure progress with different scales.
        // The progress meter will automatically disappear when we reach 100%
        super.onProgressChanged(view, progress);
        mContext.setProgress(progress * 1000);
    }

    @Override
    public boolean onConsoleMessage(ConsoleMessage cm) {
        super.onConsoleMessage(cm);
        Log.d("QibaoBuyer", cm.message() + " -- From line " + cm.lineNumber() + " of " + cm.sourceId());
        return true;
    }
}
