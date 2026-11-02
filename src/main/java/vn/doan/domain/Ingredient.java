package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.UnitType;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType unit;

    @Column(name = "current_stock", nullable = false)
    private int currentStock;

    @Column(name = "min_alert_threshold", nullable = false)
    private double minAlertThreshold;

    // QUAN HỆ NHIỀU - 1: Nhiều nguyên liệu được lưu trữ trong 1 kho tổng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public Ingredient() {
    }

    public Ingredient(String name, UnitType unit, int currentStock, double minAlertThreshold) {
        this.name = name;
        this.unit = unit;
        this.currentStock = currentStock;
        this.minAlertThreshold = minAlertThreshold;
    }

    public Ingredient(String id, String name, UnitType unit, int currentStock, double minAlertThreshold, Inventory inventory) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.currentStock = currentStock;
        this.minAlertThreshold = minAlertThreshold;
        this.inventory = inventory;
    }

    // --- GETTERS & SETTERS ---

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

    public UnitType getUnit() {
        return unit;
    }

    public void setUnit(UnitType unit) {
        this.unit = unit;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(int currentStock) {
        this.currentStock = currentStock;
    }

    public double getMinAlertThreshold() {
        return minAlertThreshold;
    }

    public void setMinAlertThreshold(double minAlertThreshold) {
        this.minAlertThreshold = minAlertThreshold;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }
}