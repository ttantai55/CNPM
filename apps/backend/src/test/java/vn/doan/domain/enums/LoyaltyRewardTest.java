package vn.doan.domain.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LoyaltyRewardTest {

    @Test
    void calculatesFixedDiscountAndCapsItAtSubtotal() {
        assertEquals(10_000, LoyaltyReward.DISCOUNT_10000.calculateDiscount(50_000, 30_000));
        assertEquals(8_000, LoyaltyReward.DISCOUNT_10000.calculateDiscount(8_000, 30_000));
    }

    @Test
    void freeDrinkRewardUsesTheHighestSingleDrinkPrice() {
        assertEquals(45_000, LoyaltyReward.FREE_HIGHEST_DRINK.calculateDiscount(100_000, 45_000));
        assertEquals(20_000, LoyaltyReward.FREE_HIGHEST_DRINK.calculateDiscount(20_000, 45_000));
    }
}
