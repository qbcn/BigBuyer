package com.qibaowu.buyer;

import android.app.Activity;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebView;

import com.qibaowu.web.InjectedChromeClient;

/**
 * Created by ronghui on 15/4/14.
 */
public class AppSafeWebChromeClient extends InjectedChromeClient {
    private Activity mContext;

    public AppSafeWebChromeClient (Object injectedObj, String injectedName, Activity activity) {
        super(injectedName, injectedObj);
        mContext = activity;
    }

    @Override
    public void onProgressChanged (WebView view, int progress) {
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
