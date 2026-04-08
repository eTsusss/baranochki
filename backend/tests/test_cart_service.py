from app.services.cart_service import CartService


def test_add_item_increments_quantity():
    service = CartService()
    cart = {1: 1}
    result = service.add_item(cart, 1, 2)
    assert result[1] == 3


def test_remove_item_deletes_when_zero():
    service = CartService()
    cart = {1: 1}
    result = service.remove_item(cart, 1, 1)
    assert 1 not in result


def test_calc_total():
    service = CartService()
    assert service.get_total({1: 2, 2: 1}, {1: 100, 2: 50}) == 250
