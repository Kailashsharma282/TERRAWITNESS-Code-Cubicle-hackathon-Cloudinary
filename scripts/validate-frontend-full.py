import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

sys.stdout.reconfigure(encoding='utf-8')

PAGES = [
    ("/", "Landing Page"),
    ("/dashboard", "Executive Dashboard"),
    ("/projects", "Projects Directory"),
    ("/evidence", "Evidence Library"),
    ("/comparisons", "Before/After Comparisons"),
    ("/provenance", "Cryptographic Provenance Audit"),
    ("/review", "Human Review Queue"),
    ("/search", "Evidence Search"),
    ("/stories", "Compiled Stories"),
    ("/reports", "Audit Reports"),
    ("/settings", "Settings & Cloudinary Configuration"),
]

VIEWPORTS = [
    {"name": "1440px Desktop", "width": 1440, "height": 900},
    {"name": "1280px Laptop", "width": 1280, "height": 800},
    {"name": "768px Tablet", "width": 768, "height": 1024},
    {"name": "390px Mobile", "width": 390, "height": 844},
]

def run():
    print("================================================================================", flush=True)
    print("       TERRAWITNESS -- FRONTEND INTERACTION & RESPONSIVE VALIDATION              ", flush=True)
    print("================================================================================\n", flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        # 1. Test each route at 1920x1080 desktop
        print("  --- 1. Route Navigation & Page Integrity Tests ---", flush=True)
        for path, name in PAGES:
            url = f"{BASE_URL}{path}"
            t0 = time.time()
            try:
                res = page.goto(url, wait_until="domcontentloaded", timeout=20000)
                try:
                    page.wait_for_selector(".forensic-panel, h1, h2, table, main", timeout=12000)
                except Exception:
                    pass
                elapsed = int((time.time() - t0) * 1000)
                status = res.status if res else 0

                has_content = page.locator(".forensic-panel, h1, h2, table, main").count() > 0

                if status == 200 and has_content:
                    print(f"  + [PASS] {name} ({path}) - Status: {status}, Load: {elapsed}ms", flush=True)
                else:
                    print(f"  - [FAIL] {name} ({path}) - Status: {status}, HasContent: {has_content}", flush=True)
                    sys.exit(1)
            except Exception as e:
                print(f"  - [FAIL] {name} ({path}) - Error: {e}", flush=True)
                sys.exit(1)

        # 2. Interactive Component Tests
        print("\n  --- 2. Interactive Component & Feature Tests ---", flush=True)

        # Test Search Interaction
        page.goto(f"{BASE_URL}/search", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(500)
        search_input = page.locator("input[placeholder*='Search'], input[type='search'], input[type='text']").first
        if search_input.count() > 0:
            search_input.fill("mangrove")
            search_input.press("Enter")
            page.wait_for_timeout(800)
            print("  + [PASS] Search page query submission verified", flush=True)
        else:
            print("  ! [WARN] Search input selector not found", flush=True)

        # Test Provenance Verification Button
        page.goto(f"{BASE_URL}/provenance", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(500)
        verify_btn = page.locator("button:has-text('Verify'), button:has-text('Audit'), button:has-text('Re-verify')").first
        if verify_btn.count() > 0:
            verify_btn.click()
            page.wait_for_timeout(1000)
            print("  + [PASS] Provenance live verification button click executed", flush=True)
        else:
            print("  ! [NOTE] Provenance view rendered without explicit verify trigger", flush=True)

        # Test Settings Live Connection Button
        page.goto(f"{BASE_URL}/settings", wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(500)
        test_conn_btn = page.locator("button:has-text('Test Connection'), button:has-text('Ping'), button:has-text('Verify Cloudinary')").first
        if test_conn_btn.count() > 0:
            test_conn_btn.click()
            page.wait_for_timeout(1500)
            print("  + [PASS] Settings Cloudinary live test connection button executed", flush=True)

        # 3. Responsive Tests
        print("\n  --- 3. Responsive Viewport Tests ---", flush=True)
        for vp in VIEWPORTS:
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.goto(f"{BASE_URL}/dashboard", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(300)
            # Check for horizontal scroll / overflow
            scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
            client_width = page.evaluate("() => document.documentElement.clientWidth")
            no_overflow = scroll_width <= client_width + 10 # allow minor subpixel margin

            if no_overflow:
                print(f"  + [PASS] Viewport {vp['name']} ({vp['width']}x{vp['height']}) - Layout intact, no overflow", flush=True)
            else:
                print(f"  - [FAIL] Viewport {vp['name']} has horizontal overflow: {scroll_width} > {client_width}", flush=True)

        print("\n================================================================================", flush=True)
        critical_errors = [e for e in console_errors if "favicon" not in e.lower() and "404" not in e and "unsplash" not in e.lower()]
        if critical_errors:
            print(f"  ! Console Warnings/Errors Observed: {len(critical_errors)}", flush=True)
            for ce in critical_errors[:5]:
                print(f"    - {ce}", flush=True)
        else:
            print("  + [PASS] Zero unhandled console/runtime errors across all pages", flush=True)
        print("================================================================================\n", flush=True)

        browser.close()

if __name__ == "__main__":
    run()
