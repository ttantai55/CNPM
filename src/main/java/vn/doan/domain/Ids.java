package vn.doan.domain;

import java.util.UUID;

public final class Ids {
    private Ids() {}

    public static String next(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().substring(0, 4);
    }
}
