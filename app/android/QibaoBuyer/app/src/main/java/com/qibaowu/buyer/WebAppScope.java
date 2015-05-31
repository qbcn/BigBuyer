package com.qibaowu.buyer;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

/**
 * Created by ronghui on 15/4/11.
 */
public class WebAppScope {
    Activity mContext;

    /** Instantiate the interface and set the context */
    WebAppScope(Activity activity) {
        mContext = activity;
    }

    /** Show a toast from the web page */
    @JavascriptInterface
    public void showToast(String toast) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public String getAppVersion() {
        return "1.0";
    }

    @JavascriptInterface
    public void setAppConfig(String json) {

    }
}
