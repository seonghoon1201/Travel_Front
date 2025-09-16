package com.yeodam.app;

import android.os.Build;
import android.os.Bundle;
import android.content.pm.ApplicationInfo;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 디버그 빌드일 때 WebView 디버깅 켜기 (BuildConfig import 없이도 동작)
        boolean isDebuggable = (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE));
        if (isDebuggable) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // ✅ Capacitor WebView 가져와서 설정
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // 쿠키 허용 (카카오 등 외부 도메인 로그인에 필요할 수 있음)
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cm.setAcceptThirdPartyCookies(webView, true);
        }

        // (선택) HTTP/HTTPS 혼합 콘텐츠 허용이 필요하면:
        // settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
    }
}
