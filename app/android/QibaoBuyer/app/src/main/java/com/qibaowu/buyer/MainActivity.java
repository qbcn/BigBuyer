package com.qibaowu.buyer;

import android.app.ActionBar;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.lang.reflect.Method;


public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Let's display the progress in the activity title bar
        getWindow().requestFeature(Window.FEATURE_PROGRESS);

        setContentView(R.layout.activity_main);

        ActionBar actionBar = getActionBar();
        actionBar.setDisplayHomeAsUpEnabled(true);

        initWebView();
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onMenuOpened(int featureId, Menu menu) {
        if (featureId == Window.FEATURE_ACTION_BAR && menu != null) {
            if (menu.getClass().getSimpleName().equals("MenuBuilder")) {
                try {
                    Method m = menu.getClass().getDeclaredMethod("setOptionalIconsVisible", Boolean.TYPE);
                    m.setAccessible(true);
                    m.invoke(menu, true);
                } catch (NoSuchMethodException e) {
                    Log.e("onMenuOpened", "setOptionalIconsVisible", e);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return super.onMenuOpened(featureId, menu);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Check if the key event was the Back button and if there's history
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        // If it wasn't the Back key or there's no web page history, bubble up to the default
        // system behavior (probably exit the activity)
        return super.onKeyDown(keyCode, event);
    }

    private void initWebView() {
        mWebView = (WebView)findViewById(R.id.webview);
        WebSettings ws = mWebView.getSettings();
        ws.setJavaScriptEnabled(true);

        WebAppScope injectObj = new WebAppScope(this);
        if (Build.VERSION.SDK_INT > 10 && Build.VERSION.SDK_INT < 17){
            mWebView.removeJavascriptInterface("searchBoxJavaBridge_");
            mWebView.setWebChromeClient(new AppSafeWebChromeClient(injectObj, "HostApp", this));
        } else {
            mWebView.setWebChromeClient(new AppWebChromeClient(this));
            mWebView.addJavascriptInterface(injectObj, "HostApp");
        }
        mWebView.setWebViewClient(new AppWebViewClient(this));

        mWebView.loadUrl(getString(R.string.start_url));
    }
}
