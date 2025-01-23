//
//  ViewController.swift
//  Time-lapse Calculator
//
//  Created by Dax Mackenzie Roggio on 5/31/23.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKUIDelegate, WKScriptMessageHandler {
	
	var webView: WKWebView!
	
	override func loadView() {
		let webConfiguration = WKWebViewConfiguration()
		webView = WKWebView(frame: .zero, configuration: webConfiguration)
		webView.uiDelegate = self
		view = webView
	}
	
	override func viewDidLoad() {
		super.viewDidLoad()
		
		if let localPath = Bundle.main.url(forResource: "/HTML/index", withExtension: "html") {
			webView.load(URLRequest(url: localPath))
		}

		let contentController = self.webView.configuration.userContentController
		contentController.add(self, name: "swiftJSBridge")
	}

	func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
		guard let message = message.body as? String else { return }
		if message == "update version text" {
			updateVersionText()
		} else if message == "review app" {
			guard let writeReviewURL = URL(string: "https://apps.apple.com/app/id884547063?action=write-review")
			else { fatalError("Expected a valid URL") }
			UIApplication.shared.open(writeReviewURL, options: [:], completionHandler: nil)
		} else { /// the only other kind of "message" we send from JavaScript is a URL to open in the default browser
			UIApplication.shared.open(URL(string: message)!)
		}
	}
	
	func updateVersionText() {
		let bundleVersion = Bundle.main.infoDictionary!["CFBundleShortVersionString"] as! String
		webView.evaluateJavaScript("$('.bundle-version').text('\(bundleVersion)');", completionHandler: nil)
	}
}
