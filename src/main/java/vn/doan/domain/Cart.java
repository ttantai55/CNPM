package vn.doan.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Cart implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<CartItem> items = new ArrayList<>();

    public Cart() {
    }

    // 1. Lấy danh sách các món trong giỏ
    public List<CartItem> getItems() {
        return items;
    }
}