import { test, expect } from "@playwright/test";

const products = [
  {
    id: 1,
    name: "Truffle",
    description: "Handmade",
    price: 220,
    image_url: "https://via.placeholder.com/320x180",
    weight: "120g",
    category: "candies"
  }
];

test("catalog -> cart -> checkout", async ({ page }) => {
  await page.addInitScript(() => {
    const payload = { sub: "admin@example.com", role: "admin" };
    const fakeToken = `x.${btoa(JSON.stringify(payload))}.x`;
    localStorage.setItem("token", fakeToken);
  });

  await page.route("**/api/products**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(products) });
  });

  await page.route("**/api/orders", async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: 77 }) });
  });

  await page.goto("/catalog");
  await page.getByTestId("product-card").first().getByTestId("add-to-cart-btn").click();

  await page.locator('[data-cy="cart-icon"]').click();
  await page.getByPlaceholder("Имя").fill("Иван");
  await page.getByPlaceholder("Телефон").fill("+79990002233");
  await page.getByPlaceholder("Адрес доставки").fill("Улица 1");
  await page.locator('label.check-row:has-text("Подтверждаю корректность данных") input[type="checkbox"]').check();
  await page.getByTestId("checkout-btn").click();

  await expect(page.getByText("Заказ успешно оформлен")).toBeVisible();
});
