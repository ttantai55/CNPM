package vn.doan.dto.response;

import vn.doan.domain.enums.UnitType;

public class IngredientResponse {
    private String id;
    private String name;
    private UnitType unit;
    private int currentStock;
    private double minAlertThreshold;
    private boolean isBelowThreshold; // Trả thêm trường này để FE dễ hiện cảnh báo đỏ

    public IngredientResponse() {}

    public IngredientResponse(String id, String name, UnitType unit, int currentStock, double minAlertThreshold, boolean isBelowThreshold) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.currentStock = currentStock;
        this.minAlertThreshold = minAlertThreshold;
        this.isBelowThreshold = isBelowThreshold;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UnitType getUnit() { return unit; }
    public void setUnit(UnitType unit) { this.unit = unit; }
    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }
    public double getMinAlertThreshold() { return minAlertThreshold; }
    public void setMinAlertThreshold(double minAlertThreshold) { this.minAlertThreshold = minAlertThreshold; }
    public boolean isBelowThreshold() { return isBelowThreshold; }
    public void setBelowThreshold(boolean belowThreshold) { isBelowThreshold = belowThreshold; }
}