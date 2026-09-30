import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "demo_media/raw_scenes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

sys.stdout.reconfigure(encoding='utf-8')

def capture():
    print("[TerraWitness] Commencing live application capture for demo...", flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1920x1080 exact Full HD viewport with device scale 1.0
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            color_scheme="dark"
        )
        page = context.new_page()

        # 1. Scene 1: Landing Page Hero & Before/After
        print("Capturing Scene 1: Landing & Hook...", flush=True)
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/scene1_landing_hero.png")
        page.mouse.wheel(0, 400)
        page.wait_for_timeout(800)
        page.screenshot(path=f"{OUTPUT_DIR}/scene1_landing_scroll.png")

        # 2. Scene 2: Evidence Library / Field Capture
        print("Capturing Scene 2: Field Reality & Asset...", flush=True)
        page.goto(f"{BASE_URL}/evidence", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1200)
        page.screenshot(path=f"{OUTPUT_DIR}/scene2_evidence_list.png")

        # Click first asset to open detail if available
        first_asset = page.locator("a[href^='/evidence/']").first
        if first_asset.count() > 0:
            first_asset.click()
            page.wait_for_timeout(1500)
            page.screenshot(path=f"{OUTPUT_DIR}/scene2_evidence_detail.png")
        else:
            page.screenshot(path=f"{OUTPUT_DIR}/scene2_evidence_detail.png")

        # 3. Scene 3: Cloudinary & Settings / Ingestion
        print("Capturing Scene 3: Cloudinary Infrastructure & Intake...", flush=True)
        page.goto(f"{BASE_URL}/settings", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/scene3_settings_overview.png")

        test_btn = page.locator("button:has-text('Test Connection')").first
        if test_btn.count() > 0:
            test_btn.click()
            page.wait_for_timeout(2500)
            page.screenshot(path=f"{OUTPUT_DIR}/scene3_cloudinary_connected.png")

        # Also capture ingest workspace
        page.goto(f"{BASE_URL}/evidence/ingest", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/scene3_ingest_workspace.png")

        # 4. Scene 4: Before / After Intelligence
        print("Capturing Scene 4: Comparison & Alignment...", flush=True)
        page.goto(f"{BASE_URL}/comparisons", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1200)
        page.screenshot(path=f"{OUTPUT_DIR}/scene4_comparisons_list.png")

        comp_link = page.locator("a[href^='/comparisons/']").first
        if comp_link.count() > 0:
            comp_link.click()
            page.wait_for_timeout(1500)
            page.screenshot(path=f"{OUTPUT_DIR}/scene4_comparison_detail.png")
            # Scroll down to metrics and observation cards
            page.mouse.wheel(0, 350)
            page.wait_for_timeout(800)
            page.screenshot(path=f"{OUTPUT_DIR}/scene4_comparison_metrics.png")

        # 5. Scene 5: Evidence Lens
        print("Capturing Scene 5: Evidence Lens & Analysis...", flush=True)
        page.goto(f"{BASE_URL}/evidence", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1000)
        first_asset = page.locator("a[href^='/evidence/']").first
        if first_asset.count() > 0:
            first_asset.click()
            page.wait_for_timeout(1500)
            page.screenshot(path=f"{OUTPUT_DIR}/scene5_evidence_lens_top.png")
            page.mouse.wheel(0, 500)
            page.wait_for_timeout(800)
            page.screenshot(path=f"{OUTPUT_DIR}/scene5_evidence_lens_metadata.png")

        # 6. Scene 6: Provenance Ledger & Live Verification
        print("Capturing Scene 6: Cryptographic Provenance Ledger...", flush=True)
        page.goto(f"{BASE_URL}/provenance", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1200)
        page.screenshot(path=f"{OUTPUT_DIR}/scene6_provenance_ledger.png")

        verify_btn = page.locator("button:has-text('Verify Evidence Chain'), button:has-text('Audit')").first
        if verify_btn.count() > 0:
            verify_btn.click()
            page.wait_for_timeout(2500)
            page.screenshot(path=f"{OUTPUT_DIR}/scene6_provenance_verified.png")

        # 7. Scene 7: Search
        print("Capturing Scene 7: Semantic & Metadata Search...", flush=True)
        page.goto(f"{BASE_URL}/search", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(800)
        search_input = page.locator("input[placeholder*='Search'], input[type='text']").first
        if search_input.count() > 0:
            search_input.fill("mangrove")
            search_input.press("Enter")
            page.wait_for_timeout(1200)
            page.screenshot(path=f"{OUTPUT_DIR}/scene7_search_results.png")

        # 8. Scene 8: Story Compiler
        print("Capturing Scene 8: Story Compiler...", flush=True)
        page.goto(f"{BASE_URL}/stories", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUTPUT_DIR}/scene8_stories_overview.png")

        compile_btn = page.locator("button:has-text('Compile'), button:has-text('Generate Story')").first
        if compile_btn.count() > 0:
            compile_btn.click()
            page.wait_for_timeout(2000)
            page.screenshot(path=f"{OUTPUT_DIR}/scene8_story_scenes.png")
        else:
            page.mouse.wheel(0, 400)
            page.wait_for_timeout(800)
            page.screenshot(path=f"{OUTPUT_DIR}/scene8_story_scenes.png")

        # 9. Scene 9: Reports & Architecture Payoff
        print("Capturing Scene 9: Audit Report & Architecture...", flush=True)
        page.goto(f"{BASE_URL}/reports", wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUTPUT_DIR}/scene9_reports_summary.png")

        browser.close()
        print("[TerraWitness] All 9 storyboard scenes captured successfully!", flush=True)

if __name__ == "__main__":
    capture()
