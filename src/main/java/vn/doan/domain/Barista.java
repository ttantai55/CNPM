package vn.doan.domain;

import java.util.ArrayList;
import java.util.List;

public class Barista {
    private String id;
    private String name;
    private List<InventoryTransaction> transactions = new ArrayList<>();

    public Barista() {
    }

    public Barista(String id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<InventoryTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<InventoryTransaction> transactions) {
        this.transactions = transactions;
    }
}