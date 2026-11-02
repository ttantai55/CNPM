package vn.doan.domain;

import java.util.ArrayList;
import java.util.List;

public class Inventory {
    private List<Ingredient> items = new ArrayList<>();

    public Inventory() {
    }

    public Inventory(List<Ingredient> items) {
        this.items = items;
    }

    public List<Ingredient> getItems() {
        return items;
    }

    public void setItems(List<Ingredient> items) {
        this.items = items;
    }
}