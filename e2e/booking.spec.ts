import { expect, test, type Page } from "@playwright/test";
import { STRUCTURAL_PROPERTY_ID } from "../src/lib/search-filters";

const HELD_NIGHTS = ["2026-09-18", "2026-09-19", "2026-09-20", "2026-09-21"];
const CHECKOUT_MORNING = "2026-09-22";

test.describe("Stay calendar", () => {
  test("marks the seeded hold and accepts an open stay request", async ({ page }) => {
    await page.goto(`/properties/${STRUCTURAL_PROPERTY_ID}`);

    await expect(page.getByRole("heading", { name: "Laperal Loft at Salcedo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stay calendar" })).toBeVisible();

    await goToMonth(page, "September 2026");

    for (const night of HELD_NIGHTS) {
      await expect(page.locator(`[data-date="${night}"]`)).toHaveAttribute("data-held", "true");
    }
    await expect(page.locator(`[data-date="${CHECKOUT_MORNING}"]`)).toHaveAttribute(
      "data-held",
      "false"
    );

    const stay = await selectOpenNight(page);
    await page.getByLabel("Name").fill("Elena Cruz");
    await page.getByLabel("Email").fill("playwright@brisarealty.ph");
    await page.getByRole("button", { name: "Request these dates" }).click();

    await expect(page.getByText("Those nights are requested.")).toBeVisible();
    await expect(page.getByText(`${stay.start} → ${stay.end}`)).toHaveCount(0);
  });
});

async function goToMonth(page: Page, label: string) {
  for (let step = 0; step < 24; step += 1) {
    const current = (await page.locator("p.font-heading.text-xl").textContent())?.trim() ?? "";
    if (current === label) return;

    const currentDate = new Date(`${current} 1`);
    const targetDate = new Date(`${label} 1`);
    if (Number.isNaN(currentDate.getTime()) || Number.isNaN(targetDate.getTime())) {
      await page.getByRole("button", { name: "Next month" }).click();
      continue;
    }
    if (targetDate > currentDate) {
      await page.getByRole("button", { name: "Next month" }).click();
    } else {
      await page.getByRole("button", { name: "Previous month" }).click();
    }
  }
  throw new Error(`Calendar did not reach ${label}`);
}

async function selectOpenNight(page: Page) {
  for (let month = 0; month < 14; month += 1) {
    const starts = page.locator('button[data-date][data-held="false"]:not([disabled])');
    const count = await starts.count();
    for (let index = 0; index < count; index += 1) {
      const start = await starts.nth(index).getAttribute("data-date");
      if (!start) continue;
      const end = nextDay(start);
      const checkout = page.locator(`button[data-date="${end}"]`);
      if ((await checkout.count()) === 0) continue;

      await starts.nth(index).click();
      if (await checkout.isDisabled()) continue;

      await checkout.click();
      await expect(page.getByText(`${start} → ${end}`)).toBeVisible();
      return { start, end };
    }
    await page.getByRole("button", { name: "Next month" }).click();
  }
  throw new Error("No open overnight stay was available on the calendar");
}

function nextDay(iso: string) {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
