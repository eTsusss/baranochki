import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../stores/cart";

const product = {
  id: 1,
  name: "Candy",
  description: "desc",
  price: 100,
  image_url: "img",
  weight: "100g",
  category: "candies"
};

describe("cart store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("adds and totals items", () => {
    const cart = useCartStore();
    cart.add(product);
    cart.add(product);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.total).toBe(200);
  });

  it("removes item", () => {
    const cart = useCartStore();
    cart.add(product);
    cart.remove(product.id);
    expect(cart.items.length).toBe(0);
  });

  it("changes quantity", () => {
    const cart = useCartStore();
    cart.add(product);
    cart.increase(product.id);
    expect(cart.items[0].quantity).toBe(2);
    cart.decrease(product.id);
    expect(cart.items[0].quantity).toBe(1);
    cart.setQuantity(product.id, 5);
    expect(cart.items[0].quantity).toBe(5);
  });
});
