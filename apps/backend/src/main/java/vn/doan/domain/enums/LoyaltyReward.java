package vn.doan.domain.enums;

import java.util.Arrays;
import java.util.Optional;

public enum LoyaltyReward {
    DISCOUNT_10000("POINTS_500_10000", 500, 10_000, false),
    DISCOUNT_25000("POINTS_1000_25000", 1_000, 25_000, false),
    FREE_HIGHEST_DRINK("POINTS_2000_FREE_DRINK", 2_000, 0, true),
    DISCOUNT_100000("POINTS_4000_100000", 4_000, 100_000, false);

    private final String code;
    private final int points;
    private final long discountAmount;
    private final boolean freeHighestDrink;

    LoyaltyReward(String code, int points, long discountAmount, boolean freeHighestDrink) {
        this.code = code;
        this.points = points;
        this.discountAmount = discountAmount;
        this.freeHighestDrink = freeHighestDrink;
    }

    public String getCode() {
        return code;
    }

    public int getPoints() {
        return points;
    }

    public long calculateDiscount(long subtotal, long highestDrinkPrice) {
        long rewardValue = freeHighestDrink ? highestDrinkPrice : discountAmount;
        return Math.min(subtotal, Math.max(0, rewardValue));
    }

    public static Optional<LoyaltyReward> findByCode(String code) {
        return Arrays.stream(values())
                .filter(reward -> reward.code.equals(code))
                .findFirst();
    }
}
