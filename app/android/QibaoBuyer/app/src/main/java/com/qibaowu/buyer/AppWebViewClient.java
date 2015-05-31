package com.qibaowu.buyer;

import android.app.Activity;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * Created by ronghui on 15/4/11.
 */
public class AppWebViewClient extends WebViewClient {
    private Activity mContext;

    public AppWebViewClient(Activity activity) {
        mContext = activity;
    }

    @Override
    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
        Toast.makeText(mContext, "出错啦! " + description, Toast.LENGTH_SHORT).show();
        super.onReceivedError(view, errorCode, description, failingUrl);
    }
}
