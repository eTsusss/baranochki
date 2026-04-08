import { defineStore } from "pinia";
import type { Product } from "~/types";

export const useCartStore = defineStore("cart", {
  state: () => ({ items: [] as Array<{ product: Product; quantity: number }> }),
  getters: {
    total: (state) => state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    count: (state) => state.items.reduce((acc, i) => acc + i.quantity, 0)
  },
  actions: {
    add(product: Product) {
      const f = this.items.find((i) => i.product.id === product.id);
      if (f) f.quantity += 1;
      else this.items.push({ product, quantity: 1 });
    },
    remove(productId: number) {
      this.items = this.items.filter((i) => i.product.id !== productId);
    },
    increase(productId: number) {
      const item = this.items.find((i) => i.product.id === productId);
      if (item) item.quantity += 1;
    },
    decrease(productId: number) {
      const item = this.items.find((i) => i.product.id === productId);
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) this.remove(productId);
    },
    setQuantity(productId: number, quantity: number) {
      const item = this.items.find((i) => i.product.id === productId);
      if (!item) return;
      item.quantity = Math.max(1, quantity);
    }
  }
});
