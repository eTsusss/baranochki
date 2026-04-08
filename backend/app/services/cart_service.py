class CartService:
    def add_item(self, cart: dict[int, int], product_id: int, qty: int = 1):
        cart[product_id] = cart.get(product_id, 0) + qty
        return cart

    def remove_item(self, cart: dict[int, int], product_id: int, qty: int = 1):
        if product_id not in cart:
            return cart
        cart[product_id] -= qty
        if cart[product_id] <= 0:
            del cart[product_id]
        return cart

    def get_total(self, cart: dict[int, int], prices: dict[int, float]) -> float:
        total = 0.0
        for pid, qty in cart.items():
            total += prices.get(pid, 0) * qty
        return round(total, 2)
