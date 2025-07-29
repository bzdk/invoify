import { NextRequest, NextResponse } from "next/server";

// Helpers
import { getInvoiceTemplate } from "@/lib/helpers";

// Variables
import { ENV, TAILWIND_CDN } from "@/lib/variables";

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
async function launchBrowser(retryCount = 0): Promise<any> {
	const maxRetries = 3;
	
	try {
		if (ENV === "production") {
			const puppeteer = await import("puppeteer-core");
			return await puppeteer.launch({
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
					"--no-first-run",
					"--no-zygote",
					"--disable-background-timer-throttling",
					"--disable-backgrounding-occluded-windows",
					"--disable-renderer-backgrounding",
					"--disable-features=TranslateUI",
					"--disable-ipc-flooding-protection",
					"--disable-default-apps",
					"--disable-extensions",
					"--disable-plugins",
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
				executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
				headless: true,
				ignoreHTTPSErrors: true,
				timeout: 30000,
			});
		} else {
			const puppeteer = await import("puppeteer");
			return await puppeteer.launch({
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
				headless: "new",
			});
		}
	} catch (error) {
		if (retryCount < maxRetries) {
			console.log(`Browser launch attempt ${retryCount + 1} failed, retrying...`);
			await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
			return launchBrowser(retryCount + 1);
		}
		throw error;
	}
}

export async function generatePdfService(req: NextRequest) {
	const body: InvoiceType = await req.json();
	let browser;
	let page;

	try {
		const ReactDOMServer = (await import("react-dom/server")).default;
		const templateId = body.details.pdfTemplate;
		const InvoiceTemplate = await getInvoiceTemplate(templateId);
		const htmlTemplate = ReactDOMServer.renderToStaticMarkup(InvoiceTemplate(body));

		browser = await launchBrowser();

		if (!browser) {
			throw new Error("Failed to launch browser");
		}

		page = await browser.newPage();
		await page.setContent(await htmlTemplate, {
			waitUntil: ["networkidle0", "load", "domcontentloaded"],
			timeout: 30000,
		});

		await page.addStyleTag({
			url: TAILWIND_CDN,
		});

		const pdf: Buffer = await page.pdf({
			format: "a4",
			printBackground: true,
			preferCSSPageSize: true,
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
