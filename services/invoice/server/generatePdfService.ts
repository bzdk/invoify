import { NextRequest, NextResponse } from "next/server";

// Chromium
import chromium from "@sparticuz/chromium";

// Helpers
import { getInvoiceTemplate } from "@/lib/helpers";

// Variables
import { CHROMIUM_EXECUTABLE_PATH, ENV, TAILWIND_CDN } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

/**
 * Generate a PDF document of an invoice based on the provided data.
 *
 * @async
 * @param {NextRequest} req - The Next.js request object.
 * @throws {Error} If there is an error during the PDF generation process.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the generated PDF.
 */
export async function generatePdfService(req: NextRequest) {
	const body: InvoiceType = await req.json();
	let browser;
	let page;

	try {
		const ReactDOMServer = (await import("react-dom/server")).default;
		const templateId = body.details.pdfTemplate;
		const InvoiceTemplate = await getInvoiceTemplate(templateId);
		const htmlTemplate = ReactDOMServer.renderToStaticMarkup(InvoiceTemplate(body));

		const puppeteer = await import("puppeteer-core");
		
		// Use system Chromium in Docker environment
		const systemChromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH;
		
		if (systemChromiumPath) {
			// Use system-installed Chromium with Docker-optimized settings
			browser = await puppeteer.launch({
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
					"--no-first-run",
					"--no-zygote",
					"--single-process",
					"--disable-extensions",
					"--disable-background-timer-throttling",
					"--disable-backgrounding-occluded-windows",
					"--disable-renderer-backgrounding",
					"--disable-features=TranslateUI",
					"--disable-ipc-flooding-protection",
					"--disable-default-apps",
					"--disable-sync",
					"--disable-translate",
					"--hide-scrollbars",
					"--mute-audio",
					"--no-default-browser-check",
					"--safebrowsing-disable-auto-update",
					"--disable-web-security",
					"--disable-features=VizDisplayCompositor",
					"--memory-pressure-off",
					"--max_old_space_size=4096"
				],
				executablePath: systemChromiumPath,
				headless: true,
				ignoreHTTPSErrors: true,
				timeout: 30000,
				protocolTimeout: 30000,
			});
		} else {
			// Fallback to @sparticuz/chromium if system Chromium is not available
			browser = await puppeteer.launch({
				args: [...chromium.args, "--disable-dev-shm-usage"],
				defaultViewport: chromium.defaultViewport,
				executablePath: await chromium.executablePath(CHROMIUM_EXECUTABLE_PATH),
				headless: true,
				ignoreHTTPSErrors: true,
				timeout: 30000,
				protocolTimeout: 30000,
			});
		}

		if (!browser) {
			throw new Error("Failed to launch browser");
		}

		page = await browser.newPage();
		
		// Set viewport and user agent for better compatibility
		await page.setViewport({ width: 1200, height: 800 });
		await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
		
		// Set content with more robust waiting strategy
		await page.setContent(htmlTemplate, {
			waitUntil: "networkidle2",
			timeout: 30000,
		});

		// Add Tailwind CSS with timeout
		try {
			await page.addStyleTag({
				url: TAILWIND_CDN,
			});
		} catch (error) {
			console.warn("Failed to load Tailwind CDN, continuing without it:", error);
		}

		// Wait a bit for any remaining resources to load
		await new Promise(resolve => setTimeout(resolve, 2000));

		const pdf: Buffer = await page.pdf({
			format: "a4",
			printBackground: true,
			preferCSSPageSize: true,
			margin: {
				top: "20px",
				right: "20px",
				bottom: "20px",
				left: "20px"
			},
			timeout: 30000,
		});

		return new NextResponse(new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename=invoice.pdf",
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
			},
			status: 200,
		});
	} catch (error) {
		console.error("PDF Generation Error:", error);
		return new NextResponse(JSON.stringify({ error: "Failed to generate PDF", details: error }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} finally {
		if (page) {
			try {
				await page.close();
			} catch (e) {
				console.error("Error closing page:", e);
			}
		}
		if (browser) {
			try {
				const pages = await browser.pages();
				await Promise.all(pages.map((p) => p.close()));
				await browser.close();
			} catch (e) {
				console.error("Error closing browser:", e);
			}
		}
	}
}
