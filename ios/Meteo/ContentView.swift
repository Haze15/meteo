import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.allowsInlineMediaPlayback = true
        cfg.mediaTypesRequiringUserActionForPlayback = []
        let v = WKWebView(frame: .zero, configuration: cfg)
        v.scrollView.contentInsetAdjustmentBehavior = .never
        v.isOpaque = false
        v.backgroundColor = .black
        v.scrollView.backgroundColor = .black
        v.load(URLRequest(url: url))
        return v
    }

    func updateUIView(_ v: WKWebView, context: Context) {
        if v.url?.absoluteString != url.absoluteString {
            v.load(URLRequest(url: url))
        }
    }
}

struct ContentView: View {
    @State private var admin = false
    private let screen = URL(string: "https://haze15.github.io/meteo/")!
    private let adminURL = URL(string: "https://haze15.github.io/meteo/admin.html")!

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Color.black.ignoresSafeArea()
            WebView(url: admin ? adminURL : screen)
                .ignoresSafeArea(admin ? [] : .all)
            Button {
                admin.toggle()
            } label: {
                Image(systemName: admin ? "xmark" : "gearshape.fill")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(10)
                    .background(Color.black.opacity(0.35))
                    .clipShape(Circle())
            }
            .padding(10)
            .opacity(admin ? 0.9 : 0.25)
        }
        .statusBarHidden(!admin)
        .preferredColorScheme(.dark)
    }
}
